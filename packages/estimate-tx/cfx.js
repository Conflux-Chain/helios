import BN from 'bn.js'
import {bn16, pre0x} from './util.js'

async function cfxEstimateGasAndCollateralAdvance(
  request,
  tx,
  retryOnNonceTooOld,
) {
  try {
    return await request({
      method: 'cfx_estimateGasAndCollateral',
      params: [tx, 'latest_state'],
    })
  } catch (err) {
    if (!retryOnNonceTooOld || !err.message?.includes?.('nonce is too old')) {
      throw err
    }

    tx.nonce = pre0x(bn16(tx.nonce).addn(1).toString(16))

    return cfxEstimateGasAndCollateralAdvance(request, tx, retryOnNonceTooOld)
  }
}

export const cfxEstimateGasAndCollateral = async (
  tx,
  {request, retryOnNonceTooOld = true},
) => {
  const simulationTx = {...tx}

  delete simulationTx.gas
  delete simulationTx.storageLimit
  delete simulationTx.gasPrice
  delete simulationTx.maxFeePerGas
  delete simulationTx.maxPriorityFeePerGas

  const result = await cfxEstimateGasAndCollateralAdvance(
    request,
    simulationTx,
    retryOnNonceTooOld,
  )

  return {
    ...result,
    estimatedGasLimit: result.gasLimit,
    estimatedStorageLimit: result.storageCollateralized,
    nonce: simulationTx.nonce,
  }
}

export const cfxGetFeeData = (
  {
    gas = '0x5208',
    gasPrice = '0x1',
    storageLimit = '0x0',
    value = '0x0',
    tokensAmount = {},
  } = {},
  {
    balance = '0x0',
    tokensBalance = {},
    willPayTxFee = true,
    willPayCollateral = true,
  } = {},
) => {
  const gasFeeDrip = bn16(gas).mul(bn16(gasPrice))
  const storageFeeDrip = bn16(storageLimit)
    .mul(bn16('0xde0b6b3a7640000' /* 1e18 */))
    .divn(1024)

  // Keep gross fees for the fee and sponsorship breakdown.
  const txFeeDrip = gasFeeDrip.add(storageFeeDrip)

  // Only the sender's share is reserved from their balance.
  const userTxFeeDrip = (willPayTxFee ? gasFeeDrip : new BN(0)).add(
    willPayCollateral ? storageFeeDrip : new BN(0),
  )

  const valueDrip = bn16(value)
  const wholeTxDrip = userTxFeeDrip.add(valueDrip)
  const balanceDrip = bn16(balance)

  let nativeMaxDrip = balanceDrip.sub(userTxFeeDrip)
  const isFeeBalanceEnough = nativeMaxDrip.gten(0)

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
    storageFeeDrip: pre0x(storageFeeDrip.toString(16)),
    txFeeDrip: pre0x(txFeeDrip.toString(16)),
    userTxFeeDrip: pre0x(userTxFeeDrip.toString(16)),
    wholeTxDrip: pre0x(wholeTxDrip.toString(16)),
    nativeMaxDrip: pre0x(nativeMaxDrip.toString(16)),
    isFeeBalanceEnough,
    isBalanceEnough,
    restNativeBalanceDrip: pre0x(restNativeBalanceDrip.toString(16)),
    tokens: tokensInfo,
  }
}

export const cfxGetFeeDataWithSponsorship = async (
  {from, to, gas, feePerGas, storageLimit, value, tokensAmount},
  {request, toAddressType, balance, tokensBalance},
) => {
  let sponsorship = {
    isBalanceEnough: true,
    willPayCollateral: true,
    willPayTxFee: true,
  }

  if (toAddressType === 'contract') {
    const result = await request({
      method: 'cfx_checkBalanceAgainstTransaction',
      params: [from, to, gas, feePerGas, storageLimit, 'latest_state'],
    })

    const {isBalanceEnough, willPayCollateral, willPayTxFee} = result || {}

    if (
      typeof isBalanceEnough !== 'boolean' ||
      typeof willPayCollateral !== 'boolean' ||
      typeof willPayTxFee !== 'boolean'
    ) {
      throw new Error('Invalid Conflux sponsorship response')
    }

    sponsorship = {
      isBalanceEnough,
      willPayCollateral,
      willPayTxFee,
    }
  }

  const feeData = cfxGetFeeData(
    {
      gas,
      gasPrice: feePerGas,
      storageLimit,
      value,
      tokensAmount,
    },
    {
      balance,
      tokensBalance,
      willPayTxFee: sponsorship.willPayTxFee,
      willPayCollateral: sponsorship.willPayCollateral,
    },
  )

  return {
    ...feeData,
    willPayCollateral: sponsorship.willPayCollateral,
    willPayTxFee: sponsorship.willPayTxFee,
    isFeeBalanceEnough:
      feeData.isFeeBalanceEnough && sponsorship.isBalanceEnough,
    isBalanceEnough: feeData.isBalanceEnough && sponsorship.isBalanceEnough,
  }
}
