import BN from 'bn.js'

const bn16 = x => new BN(x, 16)
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

export const cfxEstimate = async (
  tx,
  {request, toAddressType, networkId, tokens = {}, isFluentRequest} = {},
) => {
  if (!isFluentRequest)
    throw new Error(`usage without fluent-wallet provider is not supported yet`)

  let newTx = {...tx}
  let {from, to, gasPrice, nonce, data, value} = newTx

  if (!from) throw new Error(`Invalid from ${from}`)
  if (networkId !== undefined && !Number.isInteger(networkId))
    throw new Error(`Invalid networkId, must be an integer`)
  if (!to && !data)
    throw new Error(`Invalid tx, to and data are both undefined`)

  const promises = []
  if (networkId === undefined) {
    promises.push(
      request({method: 'cfx_netVersion'}).then(r => {
        if (r.error) throw r.error
        networkId = parseInt(r.result, 10)
      }),
    )
  }
  value = value || '0x0'

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
  let balances = []
  promises.push(
    request({
      method: 'wallet_getBalance',
      params: {users: [from], tokens: ['0x0'].concat(Object.keys(tokens))},
    }).then(r => {
      if (r.error) throw r.error
      balances = r.result[from]
    }),
  )

  await request({method: 'cfx_gasPrice'}).then(r => {
    if (r.error) throw r.error
    gasPrice = r.result
  })

  // simple send tx
  if (to && (!data || data === '0x')) {
    await Promise.all(promises)
    const fromBalance = balances['0x0']
    const storageFeeDripStr = '0x0'
    const gasFeeDrip = bn16('0x5208' /* 21000 */).mul(bn16(gasPrice))
    const gasFeeDripStr = pre0x(gasFeeDrip.toString(16))
    const balanceDrip = bn16(fromBalance)
    const nativeMaxDrip = balanceDrip.sub(gasFeeDrip)
    if (toAddressType === 'user')
      return {
        gasPrice,
        gasUsed: '0x5208',
        gasLimit: '0x5208',
        storageFeeDrip: storageFeeDripStr,
        gasFeeDrip: gasFeeDripStr,
        txFeeDrip: gasFeeDripStr,
        nativeMaxDrip: pre0x(nativeMaxDrip.toString(16)),
        storageCollateralized: '0x0',
        balanceDrip: fromBalance,
        isBalanceEnough: balanceDrip.gte(gasFeeDrip),
        isBalanceEnoughForValueAndFee: bn16(fromBalance).gte(
          bn16('0x5208').add(bn16(value)),
        ),
        willPayCollateral: true,
        willPayTxFee: true,
      }
  }

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

  await Promise.all(promises)

  // estimate
  delete newTx.gas
  delete newTx.gasLimit
  delete newTx.storageLimit
  newTx.gasPrice = gasPrice
  newTx.nonce = nonce
  let rst = await cfxEstimateGasAndCollateralAdvance(request, newTx)
  const {gasLimit, storageCollateralized} = rst

  const fromBalance = balances['0x0']

  const balanceDrip = bn16(fromBalance)
  const storageFeeDrip = bn16(storageCollateralized)
    .mul(bn16('0xde0b6b3a7640000' /* 1e18 */))
    .divn(1024)
  const gasFeeDrip = bn16(gasLimit).mul(bn16(gasPrice))
  const txFeeDrip = storageFeeDrip.add(gasFeeDrip)

  const tokensInfo = Object.entries(balances).reduce((acc, [addr, balance]) => {
    if (addr === '0x0') return acc
    const amount = bn16(tokens[addr])
    const balancebn = bn16(balance)
    const maxDrip = balancebn.sub(amount)
    const isBalanceEnough = maxDrip.gten(0)
    return {
      ...acc,
      addr: {
        balanceDrip: balance,
        isBalanceEnough,
        maxDrip: isBalanceEnough ? pre0x(maxDrip.toString(16)) : undefined,
      },
    }
  }, {})

  rst = {
    ...rst,
    tokens: tokensInfo,
    storageFeeDrip: pre0x(storageFeeDrip.toString(16)),
    gasFeeDrip: pre0x(gasFeeDrip.toString(16)),
    txFeeDrip: pre0x(txFeeDrip.toString(16)),
    balanceDrip: fromBalance,
    nativeMaxDrip: pre0x(balanceDrip.sub(txFeeDrip).toString(16)),
  }

  if (toAddressType === 'contract') {
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
    if (sponsorInfo.error) throw sponsorInfo.error
    const {isBalanceEnough, willPayCollateral, willPayTxFee} = sponsorInfo
    rst = {...rst, isBalanceEnough, willPayCollateral, willPayTxFee}
  } else {
    rst = {
      ...rst,
      isBalanceEnough: balanceDrip.gte(txFeeDrip),
      willPayCollateral: true,
      willPayTxFee: true,
    }
  }

  rst.gasPrice = gasPrice
  rst.nonce = newTx.nonce

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
