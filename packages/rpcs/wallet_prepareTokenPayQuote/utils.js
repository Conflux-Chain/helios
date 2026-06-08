import {ETH_TX_TYPES, TOKEN_PAY_NETWORK_CONFIGS} from '@fluent-wallet/consts'
import {iface as erc20Iface} from '@fluent-wallet/contract-abis/777.js'
import BN from 'bn.js'
import {addHexPrefix, stripHexPrefix} from '@fluent-wallet/utils'

const ONE_HUNDRED = new BN(100)
const TEN_18 = new BN('1000000000000000000', 10)

export function calcEstimateOverrideBalance({maxGasCost, txValue}) {
  return addHexPrefix(
    new BN(String(maxGasCost || 0), 10)
      .add(new BN(stripHexPrefix(txValue || '0x0'), 16))
      .toString(16),
  )
}

export function calcTokenCost({
  gasCost,
  tokenPrice,
  gasLevel,
  suggestedTokenPriceBumpRatio,
}) {
  const bumpCount = gasLevel === 'high' ? 2 : gasLevel === 'medium' ? 1 : 0
  const tokenPriceRatio = 100 + suggestedTokenPriceBumpRatio * bumpCount

  // baseTokenCost = gasCost * price / 1e18, rounded up
  const baseTokenCost = new BN(stripHexPrefix(gasCost), 16)
    .mul(new BN(tokenPrice, 10))
    .add(TEN_18)
    .subn(1)
    .div(TEN_18)

  // finalTokenCost = baseTokenCost * ratio / 100, rounded up
  return addHexPrefix(
    baseTokenCost
      .mul(new BN(tokenPriceRatio))
      .add(ONE_HUNDRED)
      .subn(1)
      .div(ONE_HUNDRED)
      .toString(16),
  )
}

export function calcQuoteAmount({tokenCost, tokenPrice, quoteTokenPrice}) {
  const tokenPriceBN = new BN(tokenPrice, 10)

  return addHexPrefix(
    new BN(stripHexPrefix(tokenCost), 16)
      .mul(new BN(quoteTokenPrice, 10))
      .add(tokenPriceBN)
      .subn(1)
      .div(tokenPriceBN)
      .toString(16),
  )
}

export function calcTokenAmountFromNativeAmount({nativeAmount, tokenPrice}) {
  if (!nativeAmount || !tokenPrice) return ''

  return addHexPrefix(
    new BN(stripHexPrefix(nativeAmount), 16)
      .mul(new BN(tokenPrice, 10))
      .add(TEN_18)
      .subn(1)
      .div(TEN_18)
      .toString(16),
  )
}

function multiplyHexByRatio(hexValue, ratio) {
  return addHexPrefix(
    new BN(stripHexPrefix(hexValue), 16)
      .mul(new BN(ratio))
      .div(new BN(100))
      .toString(16),
  )
}

export function calcTokenPayFeeCaps({
  baseGasPrice,
  gasLevel,
  minGasFeeRatio,
  minGasTipRatio,
  suggestedGasPriceBumpRatio,
}) {
  const bumpCount = gasLevel === 'high' ? 2 : gasLevel === 'medium' ? 1 : 0

  const maxFeeRatio = minGasFeeRatio + suggestedGasPriceBumpRatio * bumpCount
  const maxPriorityFeeRatio =
    minGasTipRatio + suggestedGasPriceBumpRatio * bumpCount

  return {
    maxFeePerGas: multiplyHexByRatio(baseGasPrice, maxFeeRatio),
    maxPriorityFeePerGas: multiplyHexByRatio(baseGasPrice, maxPriorityFeeRatio),
  }
}

export async function estimateQuoteGasCost({
  eth_estimateGas,
  networkName,
  accountAddress,
  userGas,
  transferGas,
  gasPrice,
}) {
  // Add gas for the 2 user txs.
  const senderGasLimit = addHexPrefix(
    new BN(stripHexPrefix(transferGas), 16)
      .add(new BN(stripHexPrefix(userGas), 16))
      .toString(16),
  )

  const senderGasCost = addHexPrefix(
    new BN(stripHexPrefix(senderGasLimit), 16)
      .mul(new BN(stripHexPrefix(gasPrice), 16))
      .toString(16),
  )

  // Backend uses a legacy gasPrice tx for funding, so we estimate it that way.
  const fundingGasLimit = await eth_estimateGas({networkName}, [
    {
      to: accountAddress,
      value: senderGasCost,
      gasPrice,
    },
    'latest',
  ])

  // Add funding gas on top of the 2 user txs.
  const totalGasLimit = addHexPrefix(
    new BN(stripHexPrefix(senderGasLimit), 16)
      .add(new BN(stripHexPrefix(fundingGasLimit), 16))
      .toString(16),
  )

  const gasCost = addHexPrefix(
    new BN(stripHexPrefix(totalGasLimit), 16)
      .mul(new BN(stripHexPrefix(gasPrice), 16))
      .toString(16),
  )

  return {
    fundingGasLimit,
    gasCost,
  }
}

export async function fetchTokenPayPrice(backendBaseUrl, tokenAddress) {
  const response = await fetch(
    `${backendBaseUrl}/tokenpay/price?token=${tokenAddress}`,
    {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    },
  )

  if (!response.ok) {
    throw new Error('Failed to fetch token-pay price')
  }

  const result = await response.json()

  if (result.code !== 0) {
    throw new Error('Failed to fetch token-pay price')
  }

  return result.data
}

export async function prepareTokenPayBaseContext({
  InvalidParams,
  db: {getAccountById, getNetworkById, accountAddrByNetwork},
  rpcs: {wallet_getTokenPayConfig},
  params: {networkDbId, accountId, userTx},
  ignoreQuoteTokenPriceError = false,
}) {
  const account = getAccountById(accountId)
  if (!account) {
    throw InvalidParams(`Invalid accountId ${accountId}`)
  }

  const network = getNetworkById(networkDbId)
  if (!network) {
    throw InvalidParams(`Invalid networkDbId ${networkDbId}`)
  }

  const addressRecord = accountAddrByNetwork({
    account: accountId,
    network: networkDbId,
  })
  const accountAddress = addressRecord?.value?.toLowerCase()

  if (!accountAddress) {
    throw InvalidParams(
      `Account ${accountId} has no address on network ${networkDbId}`,
    )
  }

  if (userTx.from.toLowerCase() !== accountAddress) {
    throw InvalidParams(`Invalid from address ${userTx.from}`)
  }

  if (userTx.chainId && userTx.chainId !== network.chainId) {
    throw InvalidParams(`Invalid chainId ${userTx.chainId}`)
  }

  const tokenPayConfig = await wallet_getTokenPayConfig({networkDbId})

  if (!tokenPayConfig.available) {
    throw InvalidParams('Token pay is not available on current network')
  }

  const tokenPayNetworkConfig = TOKEN_PAY_NETWORK_CONFIGS[network.chainId]
  if (!tokenPayNetworkConfig) {
    throw InvalidParams('Token pay is not available on current network')
  }

  const quoteToken = tokenPayConfig.quoteToken
  let quoteTokenPrice = null
  if (quoteToken) {
    try {
      quoteTokenPrice = await fetchTokenPayPrice(
        tokenPayNetworkConfig.backendBaseUrl,
        quoteToken.address,
      )
    } catch (err) {
      if (!ignoreQuoteTokenPriceError) throw err
    }
  }

  return {
    network,
    accountAddress,
    tokenPayConfig,
    tokenPayNetworkConfig,
    quoteToken,
    quoteTokenPrice,
  }
}

export async function prepareTokenPayExecutionContext({
  InvalidParams,
  db,
  rpcs: {eth_getTransactionCount, eth_gasPrice, ...rpcs},
  params: {networkDbId, accountId, userTx, gasLevel},
}) {
  const baseContext = await prepareTokenPayBaseContext({
    InvalidParams,
    db,
    rpcs,
    params: {networkDbId, accountId, userTx},
    ignoreQuoteTokenPriceError: true,
  })
  const {accountAddress, network, tokenPayConfig} = baseContext
  const txType = userTx.authorizationList
    ? ETH_TX_TYPES.EIP7702
    : userTx.type || ETH_TX_TYPES.EIP1559

  if (txType !== ETH_TX_TYPES.EIP1559 && txType !== ETH_TX_TYPES.EIP7702) {
    throw InvalidParams(`Unsupported user tx type ${txType}`)
  }

  if (!userTx.gas) {
    throw InvalidParams('userTx.gas is required')
  }

  const estimateStateOverride = {
    [accountAddress]: {
      balance: calcEstimateOverrideBalance({
        maxGasCost: tokenPayConfig.maxGasCost,
        txValue: userTx.value,
      }),
    },
  }
  const nonceBase = await eth_getTransactionCount({networkName: network.name}, [
    accountAddress,
    'pending',
  ])
  const baseGasPrice = await eth_gasPrice({networkName: network.name}, [])
  const feeCaps = calcTokenPayFeeCaps({
    baseGasPrice,
    gasLevel,
    minGasFeeRatio: tokenPayConfig.minGasFeeRatio,
    minGasTipRatio: tokenPayConfig.minGasTipRatio,
    suggestedGasPriceBumpRatio: tokenPayConfig.suggestedGasPriceBumpRatio,
  })

  return {
    ...baseContext,
    txType,
    nonceBase,
    feeCaps,
    estimateStateOverride,
  }
}

function buildPreparedUserTx({userTx, nonceBase, network, txType, feeCaps}) {
  return {
    from: userTx.from.toLowerCase(),
    ...(userTx.to ? {to: userTx.to.toLowerCase()} : {}),
    ...(userTx.value ? {value: userTx.value} : {}),
    ...(userTx.data ? {data: userTx.data} : {}),
    gas: userTx.gas,
    ...(userTx.authorizationList
      ? {authorizationList: userTx.authorizationList}
      : {}),
    chainId: network.chainId,
    nonce: addHexPrefix(
      new BN(stripHexPrefix(nonceBase), 16).addn(1).toString(16),
    ),
    type: txType,
    maxFeePerGas: feeCaps.maxFeePerGas,
    maxPriorityFeePerGas: feeCaps.maxPriorityFeePerGas,
  }
}

function buildTransferTokenTx({
  accountAddress,
  gasToken,
  tokenPayConfig,
  nonceBase,
  network,
  feeCaps,
}) {
  return {
    from: accountAddress,
    to: gasToken.address,
    value: '0x0',
    data: erc20Iface.encodeFunctionData('transfer', [
      tokenPayConfig.recipient,
      '0x0',
    ]),
    chainId: network.chainId,
    nonce: nonceBase,
    type: ETH_TX_TYPES.EIP1559,
    maxFeePerGas: feeCaps.maxFeePerGas,
    maxPriorityFeePerGas: feeCaps.maxPriorityFeePerGas,
  }
}

export async function prepareGasTokenQuote({
  eth_estimateGas,
  network,
  accountAddress,
  userTx,
  gasToken,
  tokenPayConfig,
  nonceBase,
  feeCaps,
  gasLevel,
  txType,
  tokenPrice,
  quoteToken,
  quoteTokenPrice,
  estimateStateOverride,
  InvalidParams,
  includeTxs = false,
}) {
  const preparedUserTx = buildPreparedUserTx({
    userTx,
    nonceBase,
    network,
    txType,
    feeCaps,
  })
  const transferTokenTx = buildTransferTokenTx({
    accountAddress,
    gasToken,
    tokenPayConfig,
    nonceBase,
    network,
    feeCaps,
  })

  transferTokenTx.gas = await eth_estimateGas({networkName: network.name}, [
    {
      ...transferTokenTx,
      data: erc20Iface.encodeFunctionData('transfer', [
        tokenPayConfig.recipient,
        '0x1',
      ]),
    },
    'latest',
    estimateStateOverride,
  ])

  const {gasCost} = await estimateQuoteGasCost({
    eth_estimateGas,
    networkName: network.name,
    accountAddress,
    userGas: preparedUserTx.gas,
    transferGas: transferTokenTx.gas,
    gasPrice: feeCaps.maxFeePerGas,
  })

  const tokenCost = calcTokenCost({
    gasCost,
    tokenPrice,
    gasLevel,
    suggestedTokenPriceBumpRatio: tokenPayConfig.suggestedTokenPriceBumpRatio,
  })

  transferTokenTx.data = erc20Iface.encodeFunctionData('transfer', [
    tokenPayConfig.recipient,
    tokenCost,
  ])

  transferTokenTx.gas = await eth_estimateGas({networkName: network.name}, [
    transferTokenTx,
    'latest',
    estimateStateOverride,
  ])

  const {fundingGasLimit, gasCost: finalGasCost} = await estimateQuoteGasCost({
    eth_estimateGas,
    networkName: network.name,
    accountAddress,
    userGas: preparedUserTx.gas,
    transferGas: transferTokenTx.gas,
    gasPrice: feeCaps.maxFeePerGas,
  })

  if (
    new BN(stripHexPrefix(finalGasCost), 16).gt(
      new BN(String(tokenPayConfig.maxGasCost), 10),
    )
  ) {
    throw InvalidParams
      ? InvalidParams('Gas cost too high')
      : new Error('Gas cost too high')
  }

  const finalTokenCost = calcTokenCost({
    gasCost: finalGasCost,
    tokenPrice,
    gasLevel,
    suggestedTokenPriceBumpRatio: tokenPayConfig.suggestedTokenPriceBumpRatio,
  })
  const quoteAmount =
    quoteTokenPrice &&
    calcQuoteAmount({
      tokenCost: finalTokenCost,
      tokenPrice,
      quoteTokenPrice,
    })

  transferTokenTx.data = erc20Iface.encodeFunctionData('transfer', [
    tokenPayConfig.recipient,
    finalTokenCost,
  ])

  return {
    gasToken,
    tokenPrice,
    quoteToken,
    quoteTokenPrice,
    quoteAmount,
    fundingGasLimit,
    gasCost: finalGasCost,
    tokenCost: finalTokenCost,
    ...(includeTxs ? {transferTokenTx, preparedUserTx} : {}),
  }
}
