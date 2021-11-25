import {
  base32Address,
  base32UserAddress,
  Bytes,
  cat,
  chainId,
  boolean,
  epochRef,
  zeroOrOne,
  map,
  Uint,
} from '@fluent-wallet/spec'
import {cfxSignTransaction} from '@fluent-wallet/signature'

export const NAME = 'cfx_signTransaction'

export const txSchema = [
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
]

export const schemas = {
  input: [
    cat,
    txSchema,
    [
      zeroOrOne,
      [
        map,
        {closed: true},
        ['epoch', {optional: true}, epochRef],
        ['returnTxMeta', {optional: true}, boolean],
      ],
    ],
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
  params: [tx, opts = {}],
  network,
}) => {
  const {epoch, returnTxMeta} = opts
  let newTx = {...tx}
  if (newTx.chainId && newTx.chainId !== network.chainId)
    throw InvalidParams(`Invalid chainId ${chainId}`)

  const fromAddr = getFromAddress({networkId: network.eid, address: newTx.from})
  // from address is not belong to wallet
  if (!fromAddr) throw InvalidParams(`Invalid from address ${newTx.from}`)

  // tx without to must have data (deploy contract)
  if (!newTx.to && !newTx.data)
    throw InvalidParams(
      `Invalid tx, [to] and [data] can't be omit at the same time`,
    )

  if (!newTx.chainId) newTx.chainId = network.chainId
  if (newTx.data === '0x') newTx.data = undefined
  if (!newTx.gasPrice) newTx.gasPrice = '0x1'

  if (!newTx.value) newTx.value = '0x0'

  if (!newTx.epochHeight)
    newTx.epochHeight = await cfx_epochNumber({errorFallThrough: true}, [
      'latest_state',
    ])

  if (!newTx.nonce) {
    newTx.nonce = await cfx_getNextNonce({errorFallThrough: true}, [
      newTx.from,
      epoch,
    ])
  }

  if (newTx.to && (!newTx.gas || !newTx.storageLimit)) {
    const {type} = await wallet_detectAddressType(
      {errorFallThrough: true},
      {address: newTx.to},
    )
    if (type !== 'contract' && !newTx.data) {
      if (!newTx.gas) newTx.gas = '0x5280'
      if (!newTx.storageLimit) newTx.storageLimit = '0x0'
    }
  }

  if (!newTx.gas || !newTx.storageLimit) {
    const {gasLimit, storageCollateralized} =
      await cfx_estimateGasAndCollateral({errorFallThrough: true}, [
        newTx,
        epoch,
      ])
    if (!newTx.gas) newTx.gas = gasLimit
    if (!newTx.storageLimit) newTx.storageLimit = storageCollateralized
  }

  const pk = await wallet_getAddressPrivateKey({addressId: fromAddr.eid})

  const raw = cfxSignTransaction(newTx, pk, network.netId)

  if (returnTxMeta) {
    return {txMeta: newTx, raw}
  }

  return raw
}
