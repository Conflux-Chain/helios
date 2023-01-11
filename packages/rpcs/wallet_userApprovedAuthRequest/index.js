import {anyp, dbid, map} from '@fluent-wallet/spec'

export const NAME = 'wallet_userApprovedAuthRequest'

export const schemas = {
  input: [map, {closed: true}, ['authReqId', dbid], ['res', anyp]],
}

export const permissions = {db: ['getAuthReqById', 'retract']}

export const main = async ({
  Err: {InvalidParams},
  db: {retract, getAuthReqById},
  params: {authReqId, res},
}) => {
  const authReq = getAuthReqById(authReqId)
  if (!authReq) throw InvalidParams(`Invalid auth request id ${authReqId}`)
  // 触发 wallet_addPendingUserAuthRequest c.read
  if (authReq.c) authReq.c.write(res)
  retract(authReqId)

  return
}
