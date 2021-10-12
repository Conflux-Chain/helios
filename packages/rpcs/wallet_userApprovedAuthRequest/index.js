import {anyp, dbid, map} from '@fluent-wallet/spec'

export const NAME = 'wallet_userApprovedAuthRequest'

export const schemas = {
  input: [map, {closed: true}, ['authReqId', dbid], ['res', anyp]],
}

export const permissions = {db: ['getAuthReqById', 'retract', 'getAuthReq']}

export const main = async ({
  Err: {InvalidParams},
  db: {retract, getAuthReqById, getAuthReq},
  params: {authReqId, res},
}) => {
  const authReq = getAuthReqById(authReqId)
  if (!authReq) throw InvalidParams(`Invalid auth request id ${authReqId}`)
  if (authReq.c) authReq.c.write(res)
  retract(authReqId)

  if (!getAuthReq()?.length) {
    const {popup} = await import('@fluent-wallet/webextension')
    popup.removePopup()
  }
  return
}
