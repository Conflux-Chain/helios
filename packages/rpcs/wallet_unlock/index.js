import {map, password} from '@cfxjs/spec'

export const NAME = 'wallet_unlock'

export const schemas = {
  input: [map, ['password', password]],
}

export const permissions = {
  locked: true,
  external: ['popup'],
  methods: ['wallet_validatePassword'],
  db: ['setPassword', 'getUnlockReq', 'retract'],
}

export const main = async ({
  params: {password},
  db: {setPassword, retract, getUnlockReq},
  rpcs: {wallet_validatePassword},
  Err: {InvalidParams},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw InvalidParams('Invalid password')
  setPassword(password)

  const unlockReq = getUnlockReq() || []
  unlockReq.forEach(({req, eid}) => req.write(true).then(() => retract(eid)))
}
