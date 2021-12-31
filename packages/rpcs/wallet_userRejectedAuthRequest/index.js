import {dbid, map, anyp} from '@fluent-wallet/spec'

export const NAME = 'wallet_userRejectedAuthRequest'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['authReqId', dbid],
    ['error', {optional: true}, anyp],
  ],
}

export const permissions = {
  db: ['getAuthReqById', 'retract'],
  external: ['popup'],
}

export const main = async ({
  Err: {InvalidParams, UserRejected},
  db: {retract, getAuthReqById},
  params: {authReqId, error},
}) => {
  const authReq = getAuthReqById(authReqId)
  if (!authReq) throw InvalidParams(`Invalid auth request id ${authReqId}`)

  if (authReq.c) {
    error = error || UserRejected()
    error.rpcData = authReq.req
    authReq.c.write(error)
  }

  retract(authReqId)

  return
}
