import * as spec from '@fluent-wallet/spec'
import genEthTxSchema from '@fluent-wallet/eth-transaction-schema'
import {ETH_TX_TYPES, TOKEN_PAY_NETWORK_CONFIGS} from '@fluent-wallet/consts'
import {iface as erc20Iface} from '@fluent-wallet/contract-abis/777.js'
import BN from 'bn.js'
import {addHexPrefix, stripHexPrefix} from '@fluent-wallet/utils'

const {map, dbid, enums, or, ethHexAddress} = spec

const {Transaction1559Unsigned, Transaction7702Unsigned} = genEthTxSchema(spec)

export const NAME = 'wallet_prepareTokenPayQuote'

export const txSchema = [or, Transaction1559Unsigned, Transaction7702Unsigned]

export const schemas = {
  input: [
    map,
    {closed: true},
    ['networkDbId', dbid],
    ['accountId', dbid],
    ['userTx', txSchema],
    ['gasTokenAddress', ethHexAddress],
    ['gasLevel', [enums, 'low', 'medium', 'high']],
  ],
}

export const permissions = {
  external: ['popup'],
  locked: true,
  methods: [
    'wallet_getTokenPayConfig',
    'eth_getTransactionCount',
    'eth_gasPrice',
    'eth_estimateGas',
  ],
  db: ['getAccountById', 'getNetworkById', 'accountAddrByNetwork'],
}

const ONE_HUNDRED = new BN(100)
const TEN_18 = new BN('1000000000000000000', 10)

function calcTokenCost({
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

function multiplyHexByRatio(hexValue, ratio) {
  return addHexPrefix(
    new BN(stripHexPrefix(hexValue), 16)
      .mul(new BN(ratio))
      .div(new BN(100))
      .toString(16),
  )
}

function calcTokenPayFeeCaps({
  baseGasPrice,
  gasLevel,
  minGasFeeRatio,
  minGasTipRatio,
  suggestedGasPriceBumpRatio,
}) {
  // low = backend minimum
  // medium = backend suggested
  // high = one extra frontend bump
  //
  // Example:
  // minGasFeeRatio = 120
  // minGasTipRatio = 20
  // suggestedGasPriceBumpRatio = 10
  // => low: fee 120, tip 20
  // => medium: fee 130, tip 30
  // => high: fee 140, tip 40
  const bumpCount = gasLevel === 'high' ? 2 : gasLevel === 'medium' ? 1 : 0

  const maxFeeRatio = minGasFeeRatio + suggestedGasPriceBumpRatio * bumpCount
  const maxPriorityFeeRatio =
    minGasTipRatio + suggestedGasPriceBumpRatio * bumpCount

  return {
    maxFeePerGas: multiplyHexByRatio(baseGasPrice, maxFeeRatio),
    maxPriorityFeePerGas: multiplyHexByRatio(baseGasPrice, maxPriorityFeeRatio),
  }
}

async function estimateQuoteGasCost({
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

async function fetchTokenPayPrice(backendBaseUrl, tokenAddress) {
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

export const main = async ({
  Err: {InvalidParams},
  db: {getAccountById, getNetworkById, accountAddrByNetwork},
  rpcs: {
    wallet_getTokenPayConfig,
    eth_getTransactionCount,
    eth_gasPrice,
    eth_estimateGas,
  },
  params: {networkDbId, accountId, userTx, gasTokenAddress, gasLevel},
}) => {
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

  const gasToken = tokenPayConfig.tokens.find(
    token => token.address.toLowerCase() === gasTokenAddress.toLowerCase(),
  )

  if (!gasToken) {
    throw InvalidParams(`Unsupported gas token ${gasTokenAddress}`)
  }

  const tokenPayNetworkConfig = TOKEN_PAY_NETWORK_CONFIGS[network.chainId]

  const txType = userTx.authorizationList
    ? ETH_TX_TYPES.EIP7702
    : userTx.type || ETH_TX_TYPES.EIP1559

  if (txType !== ETH_TX_TYPES.EIP1559 && txType !== ETH_TX_TYPES.EIP7702) {
    throw InvalidParams(`Unsupported user tx type ${txType}`)
  }

  if (!userTx.gas) {
    throw InvalidParams('userTx.gas is required')
  }

  const nonceBase = await eth_getTransactionCount({networkName: network.name}, [
    accountAddress,
    'pending',
  ])

  const baseGasPrice = await eth_gasPrice({networkName: network.name}, [])

  // Build fee caps from the current gas price and backend ratios.
  const feeCaps = calcTokenPayFeeCaps({
    baseGasPrice,
    gasLevel,
    minGasFeeRatio: tokenPayConfig.minGasFeeRatio,
    minGasTipRatio: tokenPayConfig.minGasTipRatio,
    suggestedGasPriceBumpRatio: tokenPayConfig.suggestedGasPriceBumpRatio,
  })

  const tokenPrice = await fetchTokenPayPrice(
    tokenPayNetworkConfig.backendBaseUrl,
    gasToken.address,
  )

  // transfer-token tx uses nonce N. user tx uses nonce N + 1.
  const preparedUserTx = {
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

  const transferTokenTx = {
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

  // Pass 1: estimate transfer-token gas with a small non-zero amount.
  transferTokenTx.gas = await eth_estimateGas({networkName: network.name}, [
    {
      ...transferTokenTx,
      data: erc20Iface.encodeFunctionData('transfer', [
        tokenPayConfig.recipient,
        '0x1',
      ]),
    },
    'latest',
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

  // Pass 2: replace the placeholder amount with the quoted token cost.
  transferTokenTx.gas = await eth_estimateGas({networkName: network.name}, [
    transferTokenTx,
    'latest',
  ])

  const {fundingGasLimit: finalFundingGasLimit, gasCost: finalGasCost} =
    await estimateQuoteGasCost({
      eth_estimateGas,
      networkName: network.name,
      accountAddress,
      userGas: preparedUserTx.gas,
      transferGas: transferTokenTx.gas,
      gasPrice: feeCaps.maxFeePerGas,
    })

  // Keep the final quote within the backend limit.
  if (
    new BN(stripHexPrefix(finalGasCost), 16).gt(
      new BN(String(tokenPayConfig.maxGasCost), 10),
    )
  ) {
    throw InvalidParams('Gas cost too high')
  }

  const finalTokenCost = calcTokenCost({
    gasCost: finalGasCost,
    tokenPrice,
    gasLevel,
    suggestedTokenPriceBumpRatio: tokenPayConfig.suggestedTokenPriceBumpRatio,
  })

  transferTokenTx.data = erc20Iface.encodeFunctionData('transfer', [
    tokenPayConfig.recipient,
    finalTokenCost,
  ])

  return {
    gasLevel,
    recipient: tokenPayConfig.recipient,
    gasToken,
    tokenPrice,
    nonceBase,
    baseGasPrice,
    feeCaps,
    fundingGasLimit: finalFundingGasLimit,
    gasCost: finalGasCost,
    tokenCost: finalTokenCost,
    transferTokenTx,
    preparedUserTx,
  }
}
