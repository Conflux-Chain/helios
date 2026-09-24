import BN from 'bn.js'
import {bn16, pre0x} from './util.js'
import {
  EIP7702_DELEGATION_PREFIX,
  ETH_TX_TYPES,
  NULL_HEX_ADDRESS,
} from '@fluent-wallet/consts'
import {prepareEip7702AuthorizationRequestsForEstimate} from '@fluent-wallet/utils'
import Big from 'big.js'

const ETH_INTRINSIC_GAS = 21000

const toEip7702DelegationCode = delegateAddress =>
  `${EIP7702_DELEGATION_PREFIX}${delegateAddress.slice(2).toLowerCase()}`

async function requestGasEstimate(request, tx, stateOverride) {
  const params = [tx, 'latest']

  if (stateOverride !== undefined) {
    params.push(stateOverride)
  }

  const gas = await request({
    method: 'eth_estimateGas',
    params,
  })

  return {
    gasUsed: gas,
    gasLimit: gas,
  }
}

function getBufferedGasLimit(gasUsed, gasBuffer) {
  // Round up to a whole gas unit after applying the buffer.
  const gasLimit = new Big(bn16(gasUsed).toString(10))
    .times(gasBuffer)
    .round(0, 3)

  return pre0x(new BN(gasLimit.toFixed(0), 10).toString(16))
}

async function estimateGasWithNonceRetry(tx, estimate) {
  try {
    return {
      result: await estimate(tx),
      nonce: tx.nonce,
    }
  } catch (error) {
    if (!error.message?.includes?.('nonce is too old')) {
      throw error
    }

    return estimateGasWithNonceRetry(
      {
        ...tx,
        nonce: pre0x(bn16(tx.nonce).addn(1).toString(16)),
      },
      estimate,
    )
  }
}

async function estimateEip7702SelfCall(request, tx, finalDelegateAddress) {
  const authorizationEstimate = await requestGasEstimate(request, {
    ...tx,
    to: tx.from,
    data: '0x',
  })

  const executionTx = {...tx}

  delete executionTx.type
  delete executionTx.authorizationList

  const executionEstimate = await requestGasEstimate(request, executionTx, {
    [tx.from]: {
      code: toEip7702DelegationCode(finalDelegateAddress),
    },
  })

  const combinedGas = pre0x(
    bn16(authorizationEstimate.gasLimit)
      .add(bn16(executionEstimate.gasLimit))
      .subn(ETH_INTRINSIC_GAS)
      .toString(16),
  )

  return {
    gasUsed: combinedGas,
    gasLimit: combinedGas,
  }
}

export const ethGetFeeData = (
  {gas = '0x5208', gasPrice = '0x1', value = '0x0', tokensAmount = {}} = {},
  {balance = '0x0', tokensBalance = {}} = {},
) => {
  const gasFeeDrip = bn16(gas).mul(bn16(gasPrice))
  const txFeeDrip = gasFeeDrip
  const valueDrip = bn16(value)
  const wholeTxDrip = txFeeDrip.add(valueDrip)
  const balanceDrip = bn16(balance)
  let nativeMaxDrip = balanceDrip.sub(txFeeDrip)
  let restNativeBalanceDrip = nativeMaxDrip.sub(valueDrip)
  const isBalanceEnough = restNativeBalanceDrip.gten(0)
  nativeMaxDrip = nativeMaxDrip.gten(0) ? nativeMaxDrip : new BN(0)
  restNativeBalanceDrip = restNativeBalanceDrip.gten(0)
    ? restNativeBalanceDrip
    : new BN(0)

  const tokensInfo = Object.entries(tokensAmount).reduce(
    (acc, [addr, amount]) => {
      const tokenBalanceStr = tokensBalance[addr] || '0x0'
      const tokenBalance = bn16(tokenBalanceStr)
      const restTokenBalance = tokenBalance.sub(bn16(amount || '0x0'))
      acc[addr] = {
        tokenBalance: tokenBalanceStr,
        restTokenBalance: pre0x(restTokenBalance.toString(16)),
        isTokenBalanceEnough: restTokenBalance.gten(0),
      }
      return acc
    },
    {},
  )

  return {
    balanceDrip: balance,
    gasFeeDrip: pre0x(gasFeeDrip.toString(16)),
    txFeeDrip: pre0x(txFeeDrip.toString(16)),
    wholeTxDrip: pre0x(wholeTxDrip.toString(16)),
    nativeMaxDrip: pre0x(nativeMaxDrip.toString(16)),
    isBalanceEnough,
    restNativeBalanceDrip: pre0x(restNativeBalanceDrip.toString(16)),
    tokens: tokensInfo,
  }
}

export const ethEstimate = async (
  tx = {},
  {
    request,
    toAddressType, // networkId,
    tokensAmount = {},
    isFluentRequest,
    chainIdToGasBuffer = {},
    defaultGasBuffer = 1,
  } = {},
) => {
  // we use non-standard rpcs from fluent wallet like
  // wallet_getBalance
  // wallet_detectAddressType
  if (!isFluentRequest)
    throw new Error(`usage without fluent-wallet provider is not supported yet`)
  let newTx = {...tx}

  let {
    from,
    to,
    gasPrice: customGasPrice,
    gas: customGasLimit,
    nonce: customNonce,
    data,
    value,
    type,
    maxPriorityFeePerGas: customMaxPriorityFeePerGas,
    maxFeePerGas: customMaxFeePerGas,
  } = newTx

  const network1559Compatible = await request({
    method: 'wallet_network1559Compatible',
  })

  const isEip7702Tx = type === ETH_TX_TYPES.EIP7702 || !!newTx.authorizationList
  const uses1559Fees =
    isEip7702Tx ||
    (network1559Compatible && (!type || type === ETH_TX_TYPES.EIP1559))

  let gasPrice, maxPriorityFeePerGas, maxFeePerGas, gasInfoEip1559
  let nonce = customNonce

  if (!from) throw new Error(`Invalid from ${from}`)
  if (!to && !data)
    throw new Error(`Invalid tx, to and data are both undefined`)

  const authorizationRequests = newTx.authorizationList ?? []

  const isEip7702SelfCallWithAuthorization = Boolean(
    isEip7702Tx &&
      authorizationRequests.length > 0 &&
      data &&
      data !== '0x' &&
      to?.toLowerCase() === from.toLowerCase(),
  )

  const finalAuthorization =
    authorizationRequests[authorizationRequests.length - 1]
  const finalDelegateAddress = finalAuthorization?.address

  const needsSplitEip7702Estimate =
    isEip7702SelfCallWithAuthorization &&
    finalDelegateAddress.toLowerCase() !== NULL_HEX_ADDRESS.toLowerCase()
  const promises = []

  value = value || '0x0'

  // check if to is a contract address if to exits and its type is not provided
  if (to && !toAddressType) {
    promises.push(
      request({
        method: 'wallet_detectAddressType',
        params: {address: to},
      }).then(r => {
        toAddressType = r.type
      }),
    )
  }

  // get native and token balances
  let balances = []
  promises.push(
    request({
      method: 'wallet_getBalance',
      params: {
        users: [from],
        tokens: ['0x0'].concat(Object.keys(tokensAmount)),
      },
    }).then(r => {
      balances = r[from.toLowerCase()]
    }),
  )

  // get gasPrice
  !uses1559Fees &&
    (await request({method: 'eth_gasPrice'}).then(r => {
      gasPrice = r
    }))

  //fetch maxPriorityFeePerGas and maxFeePerGas
  uses1559Fees &&
    (await request({method: 'eth_estimate1559Fee'}).then(gasInfo => {
      gasInfoEip1559 = gasInfo
      const {suggestedMaxPriorityFeePerGas, suggestedMaxFeePerGas} =
        gasInfo?.medium || {}
      maxPriorityFeePerGas = pre0x(
        new BN(
          new Big(suggestedMaxPriorityFeePerGas)
            .round(9)
            .times('1e9')
            .toString(10),
        ).toString(16),
      )
      maxFeePerGas = pre0x(
        new BN(
          new Big(suggestedMaxFeePerGas).round(9).times('1e9').toString(10),
        ).toString(16),
      )
    }))

  // get nonce, since it may affect estimateGasAndCollateral result
  if (!nonce) {
    promises.push(
      request({
        method: 'eth_getTransactionCount',
        params: [from, 'pending'],
      }).then(r => {
        nonce = r
      }),
    )
  }

  // wait for all those values
  await Promise.all(promises)
  const chainId = await request({method: 'eth_chainId'})

  // simple send tx, gas is 21000
  if (!isEip7702Tx && to && (!data || data === '0x')) {
    const calcGasPrice = customGasPrice || gasPrice
    const calcGasLimit = customGasLimit || '0x5208' /* 21000 */
    const calcMaxFeePerGas = customMaxFeePerGas || maxFeePerGas
    const ethFeeData = ethGetFeeData(
      {
        gasPrice: uses1559Fees ? calcMaxFeePerGas : calcGasPrice,
        gas: calcGasLimit,
        value,
      },
      {balance: balances['0x0']},
    )
    if (toAddressType !== 'contract')
      return {
        ...ethFeeData,
        gasPrice,
        gasUsed: '0x5208',
        gasLimit: calcGasLimit,
        nonce,
        customGasPrice,
        customGasLimit,
        customNonce,
        willPayCollateral: true,
        willPayTxFee: true,
        maxPriorityFeePerGas,
        customMaxPriorityFeePerGas,
        maxFeePerGas,
        customMaxFeePerGas,
        gasInfoEip1559,
      }
  }

  // delete passed in gas data, since they may affect
  // estimateGasAndCollateral result
  delete newTx.gas
  delete newTx.gasPrice
  delete newTx.maxFeePerGas
  delete newTx.maxPriorityFeePerGas
  newTx.nonce = nonce

  if (isEip7702Tx) {
    newTx.type = ETH_TX_TYPES.EIP7702
    newTx.chainId = newTx.chainId || chainId
  }

  const estimateTransactionGas = async transaction => {
    const transactionForEstimate = isEip7702Tx
      ? {
          ...transaction,
          authorizationList: prepareEip7702AuthorizationRequestsForEstimate(
            authorizationRequests,
            transaction.chainId,
            transaction.nonce,
          ),
        }
      : transaction

    if (needsSplitEip7702Estimate) {
      return estimateEip7702SelfCall(
        request,
        transactionForEstimate,
        finalDelegateAddress,
      )
    }

    return requestGasEstimate(request, transactionForEstimate)
  }

  const {result: estimatedGas, nonce: estimatedNonce} = customNonce
    ? {
        result: await estimateTransactionGas(newTx),
        nonce: customNonce,
      }
    : await estimateGasWithNonceRetry(newTx, estimateTransactionGas)

  const gasLimit =
    customGasLimit ||
    getBufferedGasLimit(
      estimatedGas.gasUsed,
      chainIdToGasBuffer[chainId] || defaultGasBuffer,
    )

  const feePerGas = uses1559Fees
    ? customMaxFeePerGas || maxFeePerGas
    : customGasPrice || gasPrice

  const isContract = toAddressType === 'contract'
  const feeData = ethGetFeeData(
    {
      gas: gasLimit,
      gasPrice: feePerGas,
      value,
      tokensAmount: isContract ? tokensAmount : {},
    },
    {
      balance: balances['0x0'],
      tokensBalance: balances,
    },
  )

  return {
    ...estimatedGas,
    ...feeData,
    gasLimit,
    gasPrice,
    nonce: estimatedNonce,
    customGasPrice,
    customGasLimit,
    customNonce,
    maxPriorityFeePerGas,
    customMaxPriorityFeePerGas,
    maxFeePerGas,
    customMaxFeePerGas,
    gasInfoEip1559,
    ...(isContract
      ? {}
      : {
          willPayCollateral: true,
          willPayTxFee: true,
        }),
  }
}
