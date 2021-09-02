import {dbid, map} from '@cfxjs/spec'

export const NAME = 'wallet_userRejectedAuthRequest'

export const schemas = {
  input: [map, {closed: true}, ['authReqId', dbid]],
}

export const permissions = {db: ['getAuthReqById', 'retract']}

export const main = ({
  Err: {InvalidParams, UserRjected},
  db: {retract, getAuthReqById},
  params: {authReqId},
}) => {
  const authReq = getAuthReqById(authReqId)
  if (!authReq) throw InvalidParams(`Invalid auth request id ${authReqId}`)

  if (authReq.c) {
    const error = UserRjected()
    error.rpcData = authReq.req
    authReq.c.write(error)
  }

  retract(authReqId)

  return
}
