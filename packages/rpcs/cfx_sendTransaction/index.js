import {map, dbid, or} from '@fluent-wallet/spec'
import {schemas as txSchema} from '@fluent-wallet/cfx_sign-transaction'
import {getTxHashFromRawTx} from '@fluent-wallet/signature'

export const NAME = 'cfx_sendTransaction'

export const schemas = {
  input: [
    or,
    txSchema.input,
    [map, {closed: true}, ['authReqId', dbid], ['tx', txSchema.input]],
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  methods: [
    'cfx_signTransaction',
    'cfx_sendRawTransaction',
    'wallet_addPendingUserAuthRequest',
    'wallet_userApprovedAuthRequest',
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
    cfx_sendRawTransaction,
    wallet_addPendingUserAuthRequest,
    wallet_userApprovedAuthRequest,
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
  const rawtx = await cfx_signTransaction(tx)

  if (!rawtx) throw Server(`Server error while signning tx`)

  const txhash = getTxHashFromRawTx(rawtx)
  const duptx = getAddrTxByHash({addressId: addr.eid, txhash})

  if (duptx) throw InvalidParams('duplicate tx')

  t([
    {eid: -1, tx: {payload: tx[0], hash: txhash, raw: rawtx, status: 0}},
    {eid: addr.eid, address: {tx: -1}},
    authReq && {eid: authReq.app.eid, app: {tx: -1}},
  ])

  const rst = await cfx_sendRawTransaction([rawtx])

  if (rst) t([{eid: {tx: {hash: txhash}}, tx: {status: 1}}])
  debugger

  if (params.authReqId) {
    return await wallet_userApprovedAuthRequest({
      authReqId: params.authReqId,
      res: rst,
    })
  }

  return rst
}
