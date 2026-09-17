import {getTxHashFromRawTx} from '@fluent-wallet/signature'

const EIP7702_AUTHORIZATION_DB_FIELDS = [
  'chainId',
  'address',
  'nonce',
  'yParity',
  'r',
  's',
]

function formatEip7702AuthorizationForDb(authorization) {
  return {
    eip7702Authorization: EIP7702_AUTHORIZATION_DB_FIELDS.reduce(
      (formattedAuthorization, key) => {
        if (authorization[key] !== undefined)
          formattedAuthorization[key] = authorization[key]
        return formattedAuthorization
      },
      {},
    ),
  }
}

function formatTxPayloadForDb(txMeta) {
  if (!txMeta.authorizationList) return txMeta

  return {
    ...txMeta,
    authorizationList: txMeta.authorizationList.map(
      formatEip7702AuthorizationForDb,
    ),
  }
}

export async function createPendingTransaction(
  {transaction, addressId, app, network, sendAction, callBundle},
  {
    signTransaction,
    getEthereumBlockNumber,
    getAddrTxByHash,
    transact,
    InvalidParams,
  },
) {
  const {raw: rawTransaction, txMeta} = await signTransaction(
    {
      app,
      network,
      errorFallThrough: true,
    },
    [
      transaction,
      {
        returnTxMeta: true,
      },
    ],
  )

  const txPayload = formatTxPayloadForDb(txMeta)
  const transactionHash = getTxHashFromRawTx(rawTransaction)
  const duplicateTransaction = getAddrTxByHash({
    addressId,
    txhash: transactionHash,
  })

  if (duplicateTransaction) {
    throw InvalidParams('duplicate tx')
  }

  const blockNumber =
    network.type === 'eth' &&
    (await getEthereumBlockNumber({errorFallThrough: true}, []))

  const txExtra = {ok: false}
  if (sendAction) txExtra.sendAction = sendAction

  const dbTransactions = [
    {eid: 'newTxPayload', txPayload},
    {eid: 'newTxExtra', txExtra},
    {
      eid: 'newTxId',
      tx: {
        fromFluent: true,
        txPayload: 'newTxPayload',
        hash: transactionHash,
        raw: rawTransaction,
        status: 0,
        created: new Date().getTime(),
        txExtra: 'newTxExtra',
        ...(callBundle
          ? {
              bundleId: callBundle.id,
              bundleCalls: callBundle.calls,
            }
          : {}),
      },
    },
    ...(blockNumber ? [{eid: 'newTxId', tx: {blockNumber}}] : []),
    {eid: addressId, address: {tx: 'newTxId'}},
    ...(app ? [{eid: app.eid, app: {tx: 'newTxId'}}] : []),
  ]

  const transactionReport = transact(dbTransactions)

  // DataScript maps this transaction-local temp id to the persisted entity id.
  const transactionId = transactionReport.tempids.newTxId

  return {
    transactionId,
    transactionHash,
  }
}
