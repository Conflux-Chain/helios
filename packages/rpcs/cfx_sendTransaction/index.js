import {map, dbid, or, cat} from '@fluent-wallet/spec'
import {txSchema} from '@fluent-wallet/cfx_sign-transaction'
import {getTxHashFromRawTx} from '@fluent-wallet/signature'

export const NAME = 'cfx_sendTransaction'

export const schemas = {
  input: [
    or,
    [cat, txSchema],
    [map, {closed: true}, ['authReqId', dbid], ['tx', [cat, txSchema]]],
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  methods: [
    'cfx_signTransaction',
    'wallet_addPendingUserAuthRequest',
    'wallet_userApprovedAuthRequest',
    'wallet_handleUnfinishedCFXTx',
  ],
  db: [
    'getAuthReqById',
    'getFromAddress',
    'getAddrFromNetworkAndAddress',
    'getAddrTxByHash',
    't',
  ],
}

export const main = async ({
  Err: {InvalidParams, Server},
  db: {
    getAuthReqById,
    getFromAddress,
    getAddrFromNetworkAndAddress,
    getAddrTxByHash,
    t,
  },
  rpcs: {
    cfx_signTransaction,
    wallet_addPendingUserAuthRequest,
    wallet_userApprovedAuthRequest,
    wallet_handleUnfinishedCFXTx,
  },
  params,
  _inpage,
  app,
  network,
}) => {
  if (_inpage) {
    if (params.authReqId) throw InvalidParams('Invalid tx data')

    const [{from}] = params

    // check that from address is authed to the app
    if (
      !getFromAddress({networkId: network.eid, address: from, appId: app.eid})
    )
      throw InvalidParams(`Invalid from address in tx ${from}`)

    delete params[0].nonce
    // try sign tx
    await cfx_signTransaction(params)

    return await wallet_addPendingUserAuthRequest({
      appId: app.eid,
      req: {method: NAME, params},
    })
  }

  const authReqId = params?.authReqId
  let authReq
  if (authReqId) authReq = getAuthReqById(authReqId)
  if (authReqId && !authReq)
    throw InvalidParams(`Invalid authReqId ${authReqId}`)

  // tx array [tx]
  const tx = params.authReqId ? params.tx : params
  const addr = getAddrFromNetworkAndAddress({
    networkId: network.eid,
    address: tx[0].from,
  })
  if (!addr) throw InvalidParams(`Invalid from address ${tx[0].from}`)
  const signed = await cfx_signTransaction(
    tx.concat({
      returnTxMeta: true,
    }),
  )

  if (!signed) throw Server(`Server error while signning tx`)
  const {raw: rawtx, txMeta} = signed

  const txhash = getTxHashFromRawTx(rawtx)
  const duptx = getAddrTxByHash({addressId: addr.eid, txhash})

  if (duptx) throw InvalidParams('duplicate tx')

  const {
    tempids: {newTxId},
  } = t([
    {
      eid: 'newTxId',
      tx: {
        payload: txMeta,
        hash: txhash,
        raw: rawtx,
        status: 0,
        created: new Date().getTime(),
      },
    },
    {eid: addr.eid, address: {tx: 'newTxId'}},
    authReq && {eid: authReq.app.eid, app: {tx: 'newTxId'}},
  ])

  return await new Promise(resolve => {
    wallet_handleUnfinishedCFXTx({
      tx: newTxId,
      address: addr.eid,
      okCb: rst => {
        if (params.authReqId) {
          return wallet_userApprovedAuthRequest({
            authReqId: params.authReqId,
            res: rst,
          }).then(resolve)
        }
        resolve(rst)
      },
      failedCb: err => {
        if (params.authReqId) {
          return wallet_userApprovedAuthRequest({
            authReqId: params.authReqId,
            res: err,
          }).then(resolve)
        }
      },
    })
  })
}
