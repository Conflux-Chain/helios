import {
  base32Address,
  base32UserAddress,
  Bytes,
  cat,
  chainId,
  epochRef,
  map,
  Uint,
  zeroOrOne,
} from '@fluent-wallet/spec'
import {cfxSignTransaction} from '@fluent-wallet/signature'

export const NAME = 'cfx_signTransaction'

export const schemas = {
  input: [
    cat,
    [
      map,
      {closed: true},
      ['from', base32UserAddress],
      ['to', {optional: true}, base32Address],
      ['value', {optional: true}, Uint],
      ['nonce', {optional: true}, Uint],
      ['data', {optional: true}, Bytes],
      ['gas', {optional: true}, Uint],
      ['gasPrice', {optional: true}, Uint],
      ['storageLimit', {optional: true}, Uint],
      ['chainId', {optional: true}, chainId],
      ['epochHeight', {optional: true}, Uint],
    ],
    [zeroOrOne, epochRef],
  ],
}

export const permissions = {
  external: [],
  methods: [
    'wallet_getAddressPrivateKey',
    'cfx_getNextNonce',
    'cfx_epochNumber',
    'cfx_estimateGasAndCollateral',
    'wallet_detectAddressType',
  ],
  db: ['getFromAddress'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getFromAddress},
  rpcs: {
    wallet_getAddressPrivateKey,
    cfx_epochNumber,
    cfx_estimateGasAndCollateral,
    cfx_getNextNonce,
    wallet_detectAddressType,
  },
  params: [tx, epoch],
  network,
}) => {
  let newTx = {...tx}
  let {
    from,
    data,
    to,
    gas,
    gasPrice,
    nonce,
    value,
    chainId,
    storageLimit,
    epochHeight,
  } = newTx
  if (chainId && chainId !== network.chainId)
    throw InvalidParams(`Invalid chainId ${chainId}`)

  const fromAddr = getFromAddress({networkId: network.eid, address: from})
  // from address is not belong to wallet
  if (!fromAddr) throw InvalidParams(`Invalid from address ${from}`)

  // tx without to must have data (deploy contract)
  if (!to && !data)
    throw InvalidParams(
      `Invalid tx, [to] and [data] can't be omit at the same time`,
    )

  if (!chainId) chainId = network.chainId
  if (data === '0x') data = undefined
  if (!gasPrice) gasPrice = '0x1'

  if (!value) value = '0x0'

  if (!epochHeight) epochHeight = await cfx_epochNumber(['latest_state'])

  if (!nonce) {
    nonce = await cfx_getNextNonce([from, epoch])
  }

  if (to && (!gas || !storageLimit)) {
    const {type} = await wallet_detectAddressType({address: to})
    if (type !== 'contract' && !data) {
      if (!gas) gas = '0x5280'
      if (!storageLimit) storageLimit = '0x0'
    }
  } else if (!gas || !storageLimit) {
    const {gasLimit, storageCollateralized} =
      await cfx_estimateGasAndCollateral([newTx, epoch])
    if (!gas) gas = gasLimit
    if (!storageLimit) storageLimit = storageCollateralized
  }

  const pk = await wallet_getAddressPrivateKey({addressId: fromAddr.eid})

  newTx = {
    from,
    data,
    to,
    gas,
    gasPrice,
    nonce,
    value,
    chainId,
    storageLimit,
    epochHeight,
  }
  return cfxSignTransaction(newTx, pk, network.netId)
}
