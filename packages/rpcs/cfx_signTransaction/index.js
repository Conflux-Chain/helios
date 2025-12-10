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
  catn,
  Hash32,
} from '@fluent-wallet/spec'
import {cfxSignTransaction} from '@fluent-wallet/signature'
import {ETH_TX_TYPES} from '@fluent-wallet/consts'
import {parseUnits} from '@ethersproject/units'

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
  ['type', {optional: true}, Uint],
  ['maxPriorityFeePerGas', {optional: true}, Uint],
  ['maxFeePerGas', {optional: true}, Uint],
  [
    'accessList',
    {optional: true},
    [
      catn,
      [
        'AccessListEntry',
        [
          map,
          {closed: true},
          ['address', {optional: true}, base32Address],
          ['storageKeys', {optional: true}, [catn, ['32BtyeHexValue', Hash32]]],
        ],
      ],
    ],
  ],
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
    'cfx_getBlockByEpochNumber',
    'wallet_network1559Compatible',
    'cfx_maxPriorityFeePerGas',
    'cfx_estimate1559Fee',
  ],
  db: ['findAddress'],
}

// conflux js sdk
// hex type must be integer
function formatTx(tx) {
  const newTx = {...tx}

  if (newTx.type && typeof newTx.type === 'string') {
    newTx.type = parseInt(tx.type, 16)
  }
  return newTx
}
export const main = async args => {
  const {
    app,
    Err: {InvalidParams, Internal},
    db: {findAddress},
    rpcs: {
      wallet_getAddressPrivateKey,
      cfx_epochNumber,
      cfx_gasPrice,
      cfx_estimateGasAndCollateral,
      cfx_getNextUsableNonce,
      wallet_detectAddressType,
      wallet_network1559Compatible,
      cfx_estimate1559Fee,
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
  const network1559Compatible = await wallet_network1559Compatible()

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

  /**
   * ledger app check, v1.x is not support 1559 transaction
   * so we need check this app version
   */
  let isV1LedgerAPP = false

  const needLedgerVersionCheck =
    fromAddr.account.accountGroup.vault.type === 'hw' && !dryRun && _popup
  if (needLedgerVersionCheck) {
    // is hw wallet, we check is 1.x app version
    const {Conflux: LedgerConflux} = await import('@fluent-wallet/ledger')
    let ledger = new LedgerConflux()
    // this call will establish a connection to the ledger device
    const isAppOpen = await ledger.isAppOpen()
    if (!isAppOpen) {
      throw Internal('Ledger app is not open')
    }
    const {version} = await ledger.getAppConfiguration()
    if (version[0] === '1') {
      isV1LedgerAPP = true
    }
    // disconnect from the ledger, if not disconnect will cause error when re-connect
    await ledger.cleanUp()
    ledger = null
  }

  if (!newTx.type) {
    if (network1559Compatible && !isV1LedgerAPP) {
      newTx.type = ETH_TX_TYPES.EIP1559
    } else {
      newTx.type = ETH_TX_TYPES.LEGACY
    }
  } else {
    // if there has type, we need check is v1.x ledger app
    if (isV1LedgerAPP) {
      newTx.type = ETH_TX_TYPES.LEGACY
    }
  }

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
  // EIP-1559
  const is1559Tx = newTx.type === ETH_TX_TYPES.EIP1559
  if (is1559Tx && !network1559Compatible)
    throw InvalidParams(
      `Network ${network.name} don't support 1559 transaction`,
    )
  if (!is1559Tx && !newTx.gasPrice) {
    newTx.gasPrice = await cfx_gasPrice()
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

  if (is1559Tx && network1559Compatible && !isV1LedgerAPP) {
    const gasInfoEip1559 = await cfx_estimate1559Fee()
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
      raw = cfxSignTransaction(
        formatTx(newTx),
        '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        network.netId,
      )
    } else {
      raw = await signWithHardwareWallet({
        args,
        accountId: fromAddr.account.eid,
        tx: formatTx(newTx),
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
    raw = cfxSignTransaction(formatTx(newTx), pk, network.netId)
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
  accountId,
}) {
  return await cfx_signTxWithLedgerNanoS(
    {errorFallThrough: true},
    {tx, addressId, accountId},
  )
}
