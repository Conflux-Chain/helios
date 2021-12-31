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
        ['dryRun', {optional: true}, boolean],
      ],
    ],
  ],
}

export const permissions = {
  external: [],
  methods: [
    'cfx_signTxWithLedgerNanoS',
    'wallet_getAddressPrivateKey',
    'cfx_getNextUsableNonce',
    'cfx_epochNumber',
    'cfx_estimateGasAndCollateral',
    'wallet_detectAddressType',
  ],
  db: ['findAddress'],
}

export const main = async args => {
  const {
    Err: {InvalidParams},
    db: {findAddress},
    rpcs: {
      wallet_getAddressPrivateKey,
      cfx_epochNumber,
      cfx_estimateGasAndCollateral,
      cfx_getNextUsableNonce,
      wallet_detectAddressType,
    },
    params: [tx, opts = {}],
    network,
  } = args
  const {epoch, returnTxMeta, dryRun} = opts
  let newTx = {...tx}
  if (newTx.chainId && newTx.chainId !== network.chainId)
    throw InvalidParams(`Invalid chainId ${chainId}`)

  const fromAddr = findAddress({
    networkId: network.eid,
    value: newTx.from,
    g: {eid: 1, _account: {_accountGroup: {vault: {type: 1, device: 1}}}},
  })
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
    newTx.nonce = await cfx_getNextUsableNonce({errorFallThrough: true}, [
      newTx.from,
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

  let raw
  if (fromAddr.account.accountGroup.vault.type === 'hw') {
    if (dryRun) {
      raw = cfxSignTransaction(
        newTx,
        '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        network.netId,
      )
    } else {
      raw = await signWithHardwareWallet({
        args,
        tx: newTx,
        addressId: fromAddr.eid,
        device: fromAddr.account.accountGroup.vault.device,
      })
    }
  } else {
    let pk = await wallet_getAddressPrivateKey({address: newTx.from})

    if (dryRun)
      pk = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    raw = cfxSignTransaction(newTx, pk, network.netId)
  }

  if (returnTxMeta) {
    return {txMeta: newTx, raw}
  }

  return raw
}

async function signWithHardwareWallet({
  args: {
    rpcs: {cfx_signTxWithLedgerNanoS},
  },
  tx,
  addressId,
  device,
}) {
  const hwSignMap = {LedgerNanoS: cfx_signTxWithLedgerNanoS}
  const signMethod = hwSignMap[device]
  return await signMethod({errorFallThrough: true}, {tx, addressId})
}
