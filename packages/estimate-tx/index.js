import BN from 'bn.js'
import {stripHexPrefix} from '@fluent-wallet/utils'

const bn16 = x => new BN(stripHexPrefix(x), 16)
const pre0x = x => `0x${x}`

export const ethEstimate = () => {
  throw new Error('ethEstimate is not implemented yet')
}

async function cfxEstimateGasAndCollateralAdvance(request, tx) {
  const estimateRst = await request({
    method: 'cfx_estimateGasAndCollateral',
    params: [tx, 'latest_state'],
  })

  if (estimateRst?.error?.message) {
    if (estimateRst.error.message.includes('nonce is too old')) {
      tx.nonce = pre0x(bn16(tx.nonce).addn(1).toString(16))
      return await cfxEstimateGasAndCollateralAdvance(request, tx)
    } else {
      throw estimateRst.error
    }
  }
  return estimateRst.result
}

export const cfxGetFeeData = (
  {
    gas = '0x5208',
    gasPrice = '0x1',
    storageLimit = '0x0',
    value = '0x0',
    tokensAmount = {},
  } = {},
  {balance = '0x0', tokensBalance = {}} = {},
) => {
  const gasFeeDrip = bn16(gas).mul(bn16(gasPrice))
  const storageFeeDrip = bn16(storageLimit)
    .mul(bn16('0xde0b6b3a7640000' /* 1e18 */))
    .divn(1024)
  const txFeeDrip = gasFeeDrip.add(storageFeeDrip)
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
    storageFeeDrip: pre0x(storageFeeDrip.toString(16)),
    txFeeDrip: pre0x(txFeeDrip.toString(16)),
    wholeTxDrip: pre0x(wholeTxDrip.toString(16)),
    nativeMaxDrip: pre0x(nativeMaxDrip.toString(16)),
    isBalanceEnough,
    restNativeBalanceDrip: pre0x(restNativeBalanceDrip.toString(16)),
    tokens: tokensInfo,
  }
}

export const cfxEstimate = async (
  tx = {},
  {
    request,
    toAddressType, // networkId,
    tokensAmount = {},
    isFluentRequest,
  } = {},
) => {
  // we use non-standard rpcs from fluent wallet like
  // cfx_netVersion
  // wallet_getBalance
  if (!isFluentRequest)
    throw new Error(`usage without fluent-wallet provider is not supported yet`)

  let newTx = {...tx}
  let {from, to, gasPrice, nonce, data, value} = newTx
  const {
    gas: customGas,
    gasPrice: customGasPrice,
    storageLimit: customStorageLimit,
  } = tx

  if (!from) throw new Error(`Invalid from ${from}`)
  // if (networkId !== undefined && !Number.isInteger(networkId))
  //   throw new Error(`Invalid networkId, must be an integer`)
  if (!to && !data)
    throw new Error(`Invalid tx, to and data are both undefined`)

  const promises = []
  // we don't need networkId here, since we don't use js-conflux-sdk for now
  // if (networkId === undefined) {
  //   promises.push(
  //     request({method: 'cfx_netVersion'}).then(r => {
  //       if (r.error) throw r.error
  //       networkId = parseInt(r.result, 10)
  //     }),
  //   )
  // }
  value = value || '0x0'

  // check if to is a contract address if to exits and its type is not provided
  if (to && !toAddressType) {
    promises.push(
      request({
        method: 'wallet_detectAddressType',
        params: {address: to},
      }).then(r => {
        if (r.error) throw r.error
        toAddressType = r.result.type
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
      if (r.error) throw r.error
      balances = r.result[from]
    }),
  )

  // get gasPrice
  await request({method: 'cfx_gasPrice'}).then(r => {
    if (r.error) throw r.error
    gasPrice = r.result
  })

  // simple send tx, gas is 21000, storageLimit is 0
  if (to && (!data || data === '0x')) {
    await Promise.all(promises)
    const cfxFeeData = cfxGetFeeData(
      {gasPrice, value},
      {balance: balances['0x0']},
    )
    const customCfxFeeData = cfxGetFeeData(
      {
        gasPrice: customGasPrice,
        gas: customGas,
        storageLimit: customStorageLimit,
        value,
      },
      {balance: balances['0x0']},
    )
    if (toAddressType === 'user')
      return {
        ...cfxFeeData,
        customData: customCfxFeeData,
        gasPrice,
        gasUsed: '0x5208',
        gasLimit: '0x5208',
        storageCollateralized: '0x0',
        willPayCollateral: true,
        willPayTxFee: true,
      }
  }

  // get nonce, since it may affect estimateGasAndCollateral result
  if (!nonce) {
    promises.push(
      request({
        method: 'cfx_getNextNonce',
        params: [from, 'latest_state'],
      }).then(r => {
        if (r.error) throw r.error
        nonce = r.result
      }),
    )
  }

  // wait for all thoes values
  await Promise.all(promises)

  // delete passed in gas/storage data, since they may affect
  // estimateGasAndCollateral result
  delete newTx.gas
  delete newTx.storageLimit
  delete newTx.gasPrice
  newTx.nonce = nonce

  // run estimate
  let rst = await cfxEstimateGasAndCollateralAdvance(request, newTx)
  const {gasLimit, storageCollateralized} = rst

  rst = {
    ...rst,
  }

  if (toAddressType === 'contract') {
    // check sponsor info if is contract interaction
    const sponsorInfo = await request({
      method: 'cfx_checkBalanceAgainstTransaction',
      params: [
        from,
        to,
        gasLimit,
        gasPrice,
        storageCollateralized,
        'latest_state',
      ],
    })
    const cfxFeeData = cfxGetFeeData(
      {
        gasPrice,
        gas: gasLimit,
        storageLimit: storageCollateralized,
        value,
        tokensAmount,
      },
      {balance: balances['0x0'], tokensBalance: balances},
    )
    if (sponsorInfo.error) throw sponsorInfo.error
    const {isBalanceEnough, willPayCollateral, willPayTxFee} = sponsorInfo
    rst = {
      ...rst,
      ...cfxFeeData,
      isBalanceEnough,
      willPayCollateral,
      willPayTxFee,
    }
  } else {
    const cfxFeeData = cfxGetFeeData(
      {
        gasPrice,
        gas: gasLimit,
        storageLimit: storageCollateralized,
        value,
      },
      {balance: balances['0x0']},
    )
    rst = {
      ...rst,
      ...cfxFeeData,
      willPayCollateral: true,
      willPayTxFee: true,
    }
  }

  rst.gasPrice = gasPrice
  rst.nonce = newTx.nonce

  rst.customData = cfxGetFeeData(
    {
      gasPrice: customGasPrice,
      gas: customGas,
      storageLimit: customStorageLimit,
      value,
    },
    {balance: balances['0x0']},
  )

  return rst
}

export const estimate = (tx, opts) => {
  let {type} = opts
  type = type || 'cfx'
  if (type === 'cfx') {
    return cfxEstimate(tx, opts)
  }
  return ethEstimate(tx, opts)
}
