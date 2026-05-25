import * as spec from '@fluent-wallet/spec'
import genEthTxSchema from '@fluent-wallet/eth-transaction-schema'
import {
  ethSignEip7702Transaction,
  ethSignTransaction,
  signEip7702AuthorizationList,
} from '@fluent-wallet/signature'
import {EIP7702_NETWORK_CONFIGS, ETH_TX_TYPES} from '@fluent-wallet/consts'
import {parseUnits} from '@ethersproject/units'
import BN from 'bn.js'
import {stripHexPrefix} from '@fluent-wallet/utils'

const {
  TransactionLegacyUnsigned,
  Transaction1559Unsigned,
  Transaction2930Unsigned,
  Transaction7702Unsigned,
} = genEthTxSchema(spec)

const {or, cat, zeroOrOne, map, blockRef, boolean} = spec

export const txSchema = [
  or,
  TransactionLegacyUnsigned,
  Transaction1559Unsigned,
  Transaction2930Unsigned,
  Transaction7702Unsigned,
]

export const NAME = 'eth_signTransaction'

const DRY_RUN_PRIVATE_KEY =
  '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

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
    if (newTx.authorizationList) newTx.type = ETH_TX_TYPES.EIP7702
    else if (network1559Compatible) newTx.type = ETH_TX_TYPES.EIP1559
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

  const isHardwareWallet = fromAddr.account.accountGroup.vault.type === 'hw'
  const is7702Tx = newTx.type === ETH_TX_TYPES.EIP7702
  const is1559Tx = newTx.type === ETH_TX_TYPES.EIP1559
  const uses1559Fees = is1559Tx || is7702Tx

  if (is7702Tx && isHardwareWallet) {
    throw InvalidParams(
      'EIP-7702 transactions are not supported for hardware wallets',
    )
  }

  // tx without to must have data (deploy contract)
  if (!newTx.to && !newTx.data)
    throw InvalidParams(
      `Invalid tx, [to] and [data] can't be omit at the same time`,
    )

  if (newTx.data === '0x') newTx.data = undefined
  if (!newTx.value) newTx.value = '0x0'
  if (!newTx.chainId) newTx.chainId = network.chainId
  const walletSupportsEip7702 = Boolean(EIP7702_NETWORK_CONFIGS[newTx.chainId])

  if (!newTx.nonce) {
    newTx.nonce = await eth_getTransactionCount({errorFallThrough: true}, [
      newTx.from,
      'pending',
    ])
  }
  if (is1559Tx && !network1559Compatible)
    throw InvalidParams(
      `Network ${network.name} don't support 1559 transaction`,
    )
  if (is7702Tx && !walletSupportsEip7702)
    throw InvalidParams(
      `Fluent does not support EIP-7702 transactions on ${network.name} yet`,
    )

  if (!uses1559Fees && !newTx.gasPrice) newTx.gasPrice = await eth_gasPrice()

  let pk
  if (is7702Tx) {
    pk = dryRun
      ? DRY_RUN_PRIVATE_KEY
      : await wallet_getAddressPrivateKey({
          address: newTx.from,
          accountId: fromAddr.account.eid,
        })

    newTx.authorizationList = signEip7702AuthorizationList(
      prepareEip7702AuthorizationList(
        newTx.authorizationList,
        newTx.chainId,
        newTx.nonce,
      ),
      pk,
    )
  }

  if (!is7702Tx && newTx.to && !newTx.gas) {
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
  if ((is1559Tx && network1559Compatible) || is7702Tx) {
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
  if (isHardwareWallet) {
    if (dryRun) {
      raw = ethSignTransaction(toEthersTx(newTx), DRY_RUN_PRIVATE_KEY)
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
    if (!pk)
      pk = dryRun
        ? DRY_RUN_PRIVATE_KEY
        : await wallet_getAddressPrivateKey({
            address: newTx.from,
            accountId: fromAddr.account.eid,
          })
    raw = is7702Tx
      ? ethSignEip7702Transaction(newTx, pk)
      : ethSignTransaction(toEthersTx(newTx), pk)
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
  accountId,
}) {
  return await eth_signTxWithLedgerNanoS(
    {errorFallThrough: true},
    {tx, addressId, accountId},
  )
}

function prepareEip7702AuthorizationList(authorizationList, chainId, nonce) {
  const txNonce = new BN(stripHexPrefix(nonce), 16)

  return authorizationList.map((authorization, index) => {
    const authorizationNonce = `0x${txNonce
      .clone()
      .addn(index + 1)
      .toString(16)}`

    return {
      address: authorization.address.toLowerCase(),
      chainId,
      nonce: authorizationNonce,
    }
  })
}
