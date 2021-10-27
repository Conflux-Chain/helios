import {map, dbid, or} from '@fluent-wallet/spec'
import {schemas as txSchema} from '@fluent-wallet/cfx_sign-transaction'

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
  db: ['getFromAddress'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getFromAddress},
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

  const tx = params.authReqId ? params.tx : params
  const rawtx = await cfx_signTransaction(tx)
  const rst = await cfx_sendRawTransaction([rawtx])

  if (params.authReqId) {
    return await wallet_userApprovedAuthRequest({
      authReqId: params.authReqId,
      res: rst,
    })
  }

  return rst
}
