import * as spec from '@fluent-wallet/spec'
import genEthTxSchema from '@fluent-wallet/eth-transaction-schema'
import {ETH_TX_TYPES, TOKEN_PAY_NETWORK_CONFIGS} from '@fluent-wallet/consts'
import {getTxHashFromRawTx} from '@fluent-wallet/signature'
import BN from 'bn.js'
import {stripHexPrefix} from '@fluent-wallet/utils'
import {
  fetchTokenPayPrice,
  prepareGasTokenQuote,
  prepareTokenPayExecutionContext,
} from '@fluent-wallet/wallet_prepare-token-pay-quote'

const {or, map, dbid, enums, ethHexAddress, hex} = spec

const {Transaction1559Unsigned, Transaction7702Unsigned} = genEthTxSchema(spec)

export const NAME = 'wallet_submitTokenPayTransaction'

export const userTxSchema = [
  or,
  Transaction1559Unsigned,
  Transaction7702Unsigned,
]

export const schemas = {
  input: [
    map,
    {closed: true},
    ['networkDbId', dbid],
    ['accountId', dbid],
    ['userTx', userTxSchema],
    ['gasTokenAddress', ethHexAddress],
    ['gasLevel', [enums, 'low', 'medium', 'high']],
    ['maxTokenCost', hex],
  ],
}

export const permissions = {
  external: ['popup'],
  locked: true,
  methods: [
    'eth_signTransaction',
    'wallet_getTokenPayConfig',
    'eth_getTransactionCount',
    'eth_gasPrice',
    'eth_estimateGas',
    'wallet_handleUnfinishedETHTx',
    'wallet_enrichEthereumTx',
  ],
  db: [
    'getAccountById',
    'getNetworkById',
    'accountAddrByNetwork',
    'getAddrTxByHash',
    't',
  ],
}

const EIP7702_AUTHORIZATION_DB_FIELDS = [
  'chainId',
  'address',
  'nonce',
  'yParity',
  'r',
  's',
]

function formatTxPayloadForDb(txMeta) {
  if (!txMeta.authorizationList) return txMeta

  return {
    ...txMeta,
    authorizationList: txMeta.authorizationList.map(authorization => ({
      eip7702Authorization: EIP7702_AUTHORIZATION_DB_FIELDS.reduce(
        (formattedAuthorization, key) => {
          if (authorization[key] !== undefined) {
            formattedAuthorization[key] = authorization[key]
          }
          return formattedAuthorization
        },
        {},
      ),
    })),
  }
}

async function submitTokenPayTransactions({
  backendBaseUrl,
  rawTransferTokenTx,
  rawUserTx,
}) {
  const response = await fetch(`${backendBaseUrl}/tokenpay/submit`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      rawTransferTokenTx,
      rawBusinessTx: rawUserTx,
    }),
  })

  const result = await response.json().catch(() => null)

  if (!response.ok || result?.code !== 0) {
    throw new Error(result?.message || 'Failed to submit token-pay transaction')
  }

  return result.data
}

export const main = async ({
  Err: {InvalidParams},
  db: {
    getAccountById,
    getNetworkById,
    accountAddrByNetwork,
    getAddrTxByHash,
    t,
  },
  rpcs: {
    eth_signTransaction,
    wallet_handleUnfinishedETHTx,
    wallet_enrichEthereumTx,
    ...rpcs
  },
  params: {
    networkDbId,
    accountId,
    userTx,
    gasTokenAddress,
    gasLevel,
    maxTokenCost,
  },
}) => {
  const account = getAccountById(accountId)
  if (!account) {
    throw InvalidParams(`Invalid accountId ${accountId}`)
  }

  const network = getNetworkById(networkDbId)
  if (!network) {
    throw InvalidParams(`Invalid networkDbId ${networkDbId}`)
  }

  if (network.type !== 'eth') {
    throw InvalidParams('Token pay only supports Ethereum-compatible networks')
  }

  const backendBaseUrl =
    TOKEN_PAY_NETWORK_CONFIGS[network.chainId]?.backendBaseUrl
  if (!backendBaseUrl) {
    throw InvalidParams('Token pay is not available on current network')
  }

  if (account.accountGroup?.vault?.type === 'hw') {
    throw InvalidParams('Token pay is not supported for hardware wallets')
  }

  const addressRecord = accountAddrByNetwork({
    account: accountId,
    network: networkDbId,
  })
  const accountAddress = addressRecord?.value?.toLowerCase()

  if (!accountAddress) {
    throw InvalidParams(
      `Account ${accountId} has no address on network ${networkDbId}`,
    )
  }

  if (!userTx.from || userTx.from.toLowerCase() !== accountAddress) {
    throw InvalidParams('Invalid user tx from address')
  }

  const userTxType = userTx.authorizationList
    ? ETH_TX_TYPES.EIP7702
    : userTx.type || ETH_TX_TYPES.EIP1559

  if (
    userTxType !== ETH_TX_TYPES.EIP1559 &&
    userTxType !== ETH_TX_TYPES.EIP7702
  ) {
    throw InvalidParams(`Unsupported user tx type ${userTxType}`)
  }

  const {
    tokenPayConfig,
    tokenPayNetworkConfig,
    txType,
    nonceBase,
    feeCaps,
    quoteToken,
    quoteTokenPrice,
    estimateStateOverride,
  } = await prepareTokenPayExecutionContext({
    InvalidParams,
    db: {
      getAccountById,
      getNetworkById,
      accountAddrByNetwork,
    },
    rpcs,
    params: {networkDbId, accountId, userTx, gasLevel},
  })
  const gasToken = tokenPayConfig.tokens.find(
    token => token.address.toLowerCase() === gasTokenAddress.toLowerCase(),
  )

  if (!gasToken) {
    throw InvalidParams(`Unsupported gas token ${gasTokenAddress}`)
  }

  const tokenPrice = await fetchTokenPayPrice(
    tokenPayNetworkConfig.backendBaseUrl,
    gasToken.address,
  )
  const gasTokenQuote = await prepareGasTokenQuote({
    eth_estimateGas: rpcs.eth_estimateGas,
    network,
    accountAddress,
    userTx,
    gasToken,
    tokenPayConfig,
    nonceBase,
    feeCaps,
    gasLevel,
    txType,
    tokenPrice,
    quoteToken,
    quoteTokenPrice,
    estimateStateOverride,
    InvalidParams,
    includeTxs: true,
  })

  if (
    new BN(stripHexPrefix(gasTokenQuote.tokenCost), 16).gt(
      new BN(stripHexPrefix(maxTokenCost), 16),
    )
  ) {
    throw InvalidParams('Token pay quote exceeds approved amount')
  }

  const transferTokenTx = gasTokenQuote.transferTokenTx
  const preparedUserTx = gasTokenQuote.preparedUserTx
  const signedTransferTokenTx = await eth_signTransaction({network}, [
    transferTokenTx,
    {returnTxMeta: true},
  ])
  const signedUserTx = await eth_signTransaction({network}, [
    {...preparedUserTx, type: txType},
    {returnTxMeta: true},
  ])

  const rawTransferTokenTx = signedTransferTokenTx.raw
  const rawUserTx = signedUserTx.raw
  const transferTokenTxHash = getTxHashFromRawTx(rawTransferTokenTx)
  const userTxHash = getTxHashFromRawTx(rawUserTx)

  if (
    getAddrTxByHash({
      addressId: addressRecord.eid,
      txhash: transferTokenTxHash,
    })
  ) {
    throw InvalidParams('duplicate transfer token tx')
  }

  if (
    getAddrTxByHash({
      addressId: addressRecord.eid,
      txhash: userTxHash,
    })
  ) {
    throw InvalidParams('duplicate user tx')
  }
  await submitTokenPayTransactions({
    backendBaseUrl,
    rawTransferTokenTx,
    rawUserTx,
  })

  const created = new Date().getTime()
  const transferTokenTxPayload = formatTxPayloadForDb(
    signedTransferTokenTx.txMeta,
  )
  const userTxPayload = formatTxPayloadForDb(signedUserTx.txMeta)

  const {
    tempids: {newTransferTokenTxId, newUserTxId},
  } = t([
    {eid: 'newTransferTokenTxPayload', txPayload: transferTokenTxPayload},
    {eid: 'newUserTxPayload', txPayload: userTxPayload},
    {eid: 'newTransferTokenTxExtra', txExtra: {ok: false, tokenPay: true}},
    {eid: 'newUserTxExtra', txExtra: {ok: false, tokenPay: true}},
    {
      eid: 'newTransferTokenTxId',
      tx: {
        fromFluent: true,
        txPayload: 'newTransferTokenTxPayload',
        hash: transferTokenTxHash,
        raw: rawTransferTokenTx,
        status: 2,
        created,
        pendingAt: created,
        txExtra: 'newTransferTokenTxExtra',
      },
    },
    {
      eid: 'newUserTxId',
      tx: {
        fromFluent: true,
        txPayload: 'newUserTxPayload',
        hash: userTxHash,
        raw: rawUserTx,
        status: 2,
        created,
        pendingAt: created,
        txExtra: 'newUserTxExtra',
      },
    },
    {eid: addressRecord.eid, address: {tx: 'newTransferTokenTxId'}},
    {eid: addressRecord.eid, address: {tx: 'newUserTxId'}},
  ])

  for (const txhash of [transferTokenTxHash, userTxHash]) {
    try {
      wallet_enrichEthereumTx({errorFallThrough: true, network}, {txhash})
    } catch (err) {} // eslint-disable-line no-empty
  }

  wallet_handleUnfinishedETHTx(
    {network},
    {
      tx: newTransferTokenTxId,
      address: addressRecord.eid,
    },
  )

  wallet_handleUnfinishedETHTx(
    {network},
    {
      tx: newUserTxId,
      address: addressRecord.eid,
    },
  )

  return {
    transferTokenTxHash,
    userTxHash,
  }
}
