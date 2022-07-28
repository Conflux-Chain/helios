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
import {consts as ledgerConsts} from '@fluent-wallet/ledger'

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
  ['gasLimit', {doc: 'gas limit, same as the "gas" key', optional: true}, Uint],
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
    'cfx_gasPrice',
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
    app,
    Err: {InvalidParams},
    db: {findAddress},
    rpcs: {
      wallet_getAddressPrivateKey,
      cfx_epochNumber,
      cfx_gasPrice,
      cfx_estimateGasAndCollateral,
      cfx_getNextUsableNonce,
      wallet_detectAddressType,
    },
    params: [tx, opts = {}],
    network,
    _popup,
  } = args
  if (tx.chainId && tx.chainId !== network.chainId)
    throw InvalidParams(`Invalid chainId ${tx.chainId}`)

  const {epoch, returnTxMeta, dryRun} = opts
  tx.from = tx.from.toLowerCase()
  if (tx.to) tx.to = tx.to.toLowerCase()
  const newTx = {...tx}

  const fromAddr = findAddress({
    appId: app && app.eid,
    selected: _popup && !app ? true : undefined,
    value: newTx.from,
    g: {
      eid: 1,
      _account: {eid: 1, _accountGroup: {vault: {type: 1, device: 1}}},
    },
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
      if (!newTx.gas) newTx.gas = '0x5208'
      if (!newTx.storageLimit) newTx.storageLimit = '0x0'
    }
  }

  if (!newTx.gasPrice) newTx.gasPrice = await cfx_gasPrice()

  if (!newTx.gas || !newTx.storageLimit) {
    try {
      const {gasLimit, storageCollateralized} =
        await cfx_estimateGasAndCollateral({errorFallThrough: true}, [
          newTx,
          epoch,
        ])
      if (!newTx.gas) newTx.gas = gasLimit
      if (!newTx.storageLimit) newTx.storageLimit = storageCollateralized
    } catch (err) {
      err.data = {originalData: err.data, estimateError: true}
      throw err
    }
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
        accountId: fromAddr.account.eid,
        tx: newTx,
        addressId: fromAddr.eid,
        device: fromAddr.account.accountGroup.vault.device,
      })
    }
  } else {
    let pk = await wallet_getAddressPrivateKey({
      address: newTx.from,
      accountId: fromAddr.account.eid,
    })

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
  accountId,
}) {
  const hwSignMap = {
    [ledgerConsts.LEDGER_NANOS_NAME]: cfx_signTxWithLedgerNanoS,
    [ledgerConsts.LEDGER_NANOX_NAME]: cfx_signTxWithLedgerNanoS,
  }
  const signMethod = hwSignMap[device]
  return await signMethod({errorFallThrough: true}, {tx, addressId, accountId})
}
