import {anyp, dbid, map} from '@cfxjs/spec'

export const NAME = 'wallet_userApprovedAuthRequest'

export const schemas = {
  input: [map, {closed: true}, ['authReqId', dbid], ['res', anyp]],
}

export const permissions = {db: ['getAuthReqById', 'retract']}

export const main = ({
  Err: {InvalidParams},
  db: {retract, getAuthReqById},
  params: {authReqId, res},
}) => {
  const authReq = getAuthReqById(authReqId)
  if (!authReq) throw InvalidParams(`Invalid auth request id ${authReqId}`)
  if (authReq.c) authReq.c.write(res)
  retract(authReqId)
  return
}
