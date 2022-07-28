import * as spec from '@fluent-wallet/spec'
import genEthTxSchema from '@fluent-wallet/eth-transaction-schema'
import {ethSignTransaction} from '@fluent-wallet/signature'
import {consts as ledgerConsts} from '@fluent-wallet/ledger'
import {ETH_TX_TYPES} from '@fluent-wallet/consts'
import {parseUnits} from '@ethersproject/units'

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

// ethers.js
// 1. don't allow from in tx
// 2. use `gasLimit` instead of `gas` in tx
// 3. type must be an integer
function toEthersTx(tx) {
  // eslint-disable-next-line no-unused-vars
  const {from, type, gas, chainId, ...ethersTx} = tx
  ethersTx.chainId = parseInt(chainId, 16)
  ethersTx.gasLimit = gas
  ethersTx.type = parseInt(type, 16)
  if (type === ETH_TX_TYPES.EIP1559) {
    //EIP-1559
    delete ethersTx.gasPrice
  }
  return ethersTx
}

export const permissions = {
  external: [],
  methods: [
    'eth_signTxWithLedgerNanoS',
    'wallet_getAddressPrivateKey',
    'eth_getTransactionCount',
    'eth_gasPrice',
    'eth_estimateGas',
    'wallet_detectAddressType',
    'wallet_network1559Compatible',
    'eth_estimate1559Fee',
  ],
  db: ['findAddress'],
}

export const main = async args => {
  const {
    Err: {InvalidParams},
    db: {findAddress},
    rpcs: {
      eth_gasPrice,
      wallet_network1559Compatible,
      wallet_getAddressPrivateKey,
      eth_estimateGas,
      eth_getTransactionCount,
      wallet_detectAddressType,
      eth_estimate1559Fee,
    },
    params: [tx, opts = {}],
    app,
    network,
    _popup,
  } = args
  if (tx.chainId && tx.chainId !== network.chainId)
    throw InvalidParams(`Invalid chainId ${tx.chainId}`)

  const {block, returnTxMeta, dryRun} = opts

  tx.from = tx.from.toLowerCase()
  if (tx.to) tx.to = tx.to.toLowerCase()
  const newTx = {...tx}
  const network1559Compatible = await wallet_network1559Compatible()
  if (!newTx.type) {
    if (network1559Compatible) newTx.type = ETH_TX_TYPES.EIP1559
    else newTx.type = ETH_TX_TYPES.LEGACY
  }

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

  if (newTx.data === '0x') newTx.data = undefined
  if (!newTx.value) newTx.value = '0x0'

  if (!newTx.nonce) {
    newTx.nonce = await eth_getTransactionCount({errorFallThrough: true}, [
      newTx.from,
      'pending',
    ])
  }
  // EIP-1559
  const is1559Tx = newTx.type === ETH_TX_TYPES.EIP1559
  if (is1559Tx && !network1559Compatible)
    throw InvalidParams(
      `Network ${network.name} don't support 1559 transaction`,
    )

  if (!is1559Tx && !newTx.gasPrice) newTx.gasPrice = await eth_gasPrice()

  if (newTx.to && !newTx.gas) {
    const {contract: typeContract} = await wallet_detectAddressType(
      {errorFallThrough: true},
      {address: newTx.to},
    )
    if (!typeContract && !newTx.data) {
      if (!newTx.gas) newTx.gas = '0x5208'
    }
  }
  if (!newTx.gas) {
    try {
      newTx.gas = await eth_estimateGas({errorFallThrough: true}, [
        newTx,
        block || 'latest',
      ])
    } catch (err) {
      err.data = {originalData: err.data, estimateError: true}
      throw err
    }
  }

  if (!newTx.chainId) newTx.chainId = network.chainId
  if (is1559Tx && network1559Compatible) {
    const gasInfoEip1559 = await eth_estimate1559Fee()
    const {suggestedMaxPriorityFeePerGas, suggestedMaxFeePerGas} =
      gasInfoEip1559?.medium || {}
    if (!newTx.maxPriorityFeePerGas)
      newTx.maxPriorityFeePerGas = parseUnits(
        suggestedMaxPriorityFeePerGas,
        'gwei',
      ).toHexString()
    if (!newTx.maxFeePerGas)
      newTx.maxFeePerGas = parseUnits(
        suggestedMaxFeePerGas,
        'gwei',
      ).toHexString()
  }
  let raw
  if (fromAddr.account.accountGroup.vault.type === 'hw') {
    if (dryRun) {
      raw = ethSignTransaction(
        toEthersTx(newTx),
        '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      )
    } else {
      raw = await signWithHardwareWallet({
        args,
        accountId: fromAddr.account.eid,
        tx: toEthersTx(newTx),
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
    raw = ethSignTransaction(toEthersTx(newTx), pk)
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
