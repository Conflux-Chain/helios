import BN from 'bn.js'
import Big from 'big.js'
import {bn16, pre0x} from './util.js'
import {
  EIP7702_DELEGATION_PREFIX,
  ETH_TX_TYPES,
  NULL_HEX_ADDRESS,
} from '@fluent-wallet/consts'
import {prepareEip7702AuthorizationRequestsForEstimate} from '@fluent-wallet/utils'

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

function getBufferedGasLimit(gasLimit, gasBuffer) {
  // Round up after applying the network buffer.
  const bufferedGasLimit = new Big(bn16(gasLimit).toString(10))
    .times(gasBuffer)
    .round(0, 3)

  return pre0x(new BN(bufferedGasLimit.toFixed(0), 10).toString(16))
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
    to: NULL_HEX_ADDRESS,
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

export const ethEstimateGas = async (
  tx,
  {request, chainId, gasBuffer = 1, retryOnNonceTooOld = false},
) => {
  const simulationTx = {...tx}
  const {from, to, data} = simulationTx

  const isEip7702Tx =
    simulationTx.type === ETH_TX_TYPES.EIP7702 ||
    !!simulationTx.authorizationList

  const authorizationRequests = simulationTx.authorizationList ?? []

  // Keep the existing behavior: estimate without supplied limits or prices.
  delete simulationTx.gas
  delete simulationTx.gasPrice
  delete simulationTx.maxFeePerGas
  delete simulationTx.maxPriorityFeePerGas

  if (isEip7702Tx) {
    simulationTx.type = ETH_TX_TYPES.EIP7702
    simulationTx.chainId = simulationTx.chainId || chainId
  }

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

  const {result, nonce} = retryOnNonceTooOld
    ? await estimateGasWithNonceRetry(simulationTx, estimateTransactionGas)
    : {
        result: await estimateTransactionGas(simulationTx),
        nonce: simulationTx.nonce,
      }

  return {
    ...result,
    gasLimit: getBufferedGasLimit(result.gasLimit, gasBuffer),
    // Keep the node estimate as the validation minimum.
    estimatedGasLimit: result.gasLimit,
    nonce,
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
    userTxFeeDrip: pre0x(txFeeDrip.toString(16)),
    wholeTxDrip: pre0x(wholeTxDrip.toString(16)),
    nativeMaxDrip: pre0x(nativeMaxDrip.toString(16)),
    isFeeBalanceEnough: balanceDrip.gte(txFeeDrip),
    isBalanceEnough,
    restNativeBalanceDrip: pre0x(restNativeBalanceDrip.toString(16)),
    tokens: tokensInfo,
  }
}
