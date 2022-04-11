import * as spec from '@fluent-wallet/spec'
import genEthTxSchema from '@fluent-wallet/eth-transaction-schema'
import {ethSignTransaction} from '@fluent-wallet/signature'
import {consts as ledgerConsts} from '@fluent-wallet/ledger'

const {
  TransactionLegacyUnsigned,
  Transaction1559Unsigned,
  Transaction2930Unsigned,
} = genEthTxSchema(spec)

const {or, cat, zeroOrOne, map, blockRef, boolean} = spec

export const txSchema = [
  or,
  TransactionLegacyUnsigned,
  Transaction1559Unsigned,
  Transaction2930Unsigned,
]

export const NAME = 'eth_signTransaction'

export const schemas = {
  input: [
    cat,
    txSchema,
    [
      zeroOrOne,
      [
        map,
        {closed: true},
        ['block', {optional: true}, blockRef],
        ['returnTxMeta', {optional: true}, boolean],
        ['dryRun', {optional: true}, boolean],
      ],
    ],
  ],
}

export const permissions = {
  external: [],
  methods: [
    // TODO: ledger support for eth
    // 'eth_signTxWithLedgerNanoS',
    'wallet_getAddressPrivateKey',
    'eth_getTransactionCount',
    // 'eth_blockNumber',
    'eth_gasPrice',
    'eth_estimateGas',
    'wallet_detectAddressType',
    // 'wallet_network1559Compatible',
  ],
  db: ['findAddress'],
}

export const main = async args => {
  const {
    Err: {InvalidParams},
    db: {findAddress},
    rpcs: {
      // eth_blockNumber,
      eth_gasPrice,
      // wallet_network1559Compatible,
      wallet_getAddressPrivateKey,
      eth_estimateGas,
      eth_getTransactionCount,
      wallet_detectAddressType,
    },
    params: [tx, opts = {}],
    app,
    network,
  } = args

  const {block, returnTxMeta, dryRun} = opts
  // ethers.js
  // 1. don't allow from in tx
  // 2. use `gasLimit` instead of `gas` in tx
  let {from, gas, type, ...newTx} = {...tx}
  type = type || '0x0'
  newTx.type = parseInt(type, 16)
  newTx.gasLimit = gas
  if (newTx.chainId && newTx.chainId !== network.chainId)
    throw InvalidParams(`Invalid chainId ${newTx.chainId}`)

  const fromAddr = findAddress({
    appId: app && app.eid,
    networkId: app ? app.currentNetwork.eid : network.eid,
    value: from,
    g: {
      eid: 1,
      _account: {eid: 1, _accountGroup: {vault: {type: 1, device: 1}}},
    },
  })
  // from address is not belong to wallet
  if (!fromAddr) throw InvalidParams(`Invalid from address ${from}`)

  // tx without to must have data (deploy contract)
  if (!newTx.to && !newTx.data)
    throw InvalidParams(
      `Invalid tx, [to] and [data] can't be omit at the same time`,
    )

  const legacyTx = !newTx.type || newTx.type === '0x0'
  if (!legacyTx) throw InvalidParams(`Fluent don't support EIP-1559 yet`)
  // TODO: EIP-1559 support
  // const network1559Compatible = await wallet_network1559Compatible()
  // if (!legacyTx && network1559Compatible)
  //   throw InvalidParams(
  //     `Network ${network.name} don't support 1559 transactions`,
  //   )

  if (!newTx.chainId) newTx.chainId = network.chainId
  newTx.chainId = parseInt(newTx.chainId, 16)
  if (newTx.data === '0x') newTx.data = undefined
  if (!newTx.gasPrice) newTx.gasPrice = await eth_gasPrice()

  if (!newTx.value) newTx.value = '0x0'

  if (!newTx.nonce) {
    newTx.nonce = await eth_getTransactionCount({errorFallThrough: true}, [
      from,
      'pending',
    ])
  }

  if (newTx.to && !newTx.gasLimit) {
    const {contract: typeContract} = await wallet_detectAddressType(
      {errorFallThrough: true},
      {address: newTx.to},
    )
    if (!typeContract && !newTx.data) {
      if (!newTx.gasLimit) newTx.gasLimit = '0x5208'
    }
  }

  if (!newTx.gasLimit) {
    const gasLimit = await eth_estimateGas({errorFallThrough: true}, [
      newTx,
      block || 'latest',
    ])
    if (!newTx.gasLimit) newTx.gasLimit = gasLimit
  }

  let raw
  if (fromAddr.account.accountGroup.vault.type === 'hw') {
    if (dryRun) {
      raw = ethSignTransaction(
        newTx,
        '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
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
      address: from,
      accountId: fromAddr.account.eid,
    })

    if (dryRun)
      pk = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    raw = ethSignTransaction(newTx, pk)
  }

  if (returnTxMeta) {
    return {txMeta: newTx, raw}
  }

  return raw
}

async function signWithHardwareWallet({
  args: {
    rpcs: {eth_signTxWithLedgerNanoS},
  },
  tx,
  addressId,
  device,
  accountId,
}) {
  const hwSignMap = {
    [ledgerConsts.LEDGER_NANOS_NAME]: eth_signTxWithLedgerNanoS,
    [ledgerConsts.LEDGER_NANOX_NAME]: eth_signTxWithLedgerNanoS,
  }
  const signMethod = hwSignMap[device]
  return await signMethod({errorFallThrough: true}, {tx, addressId, accountId})
}
