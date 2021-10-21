import {map, password, truep} from '@fluent-wallet/spec'

export const NAME = 'wallet_unlock'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['password', password],
    ['waitSideEffects', {optional: true}, truep],
  ],
}

export const permissions = {
  locked: true,
  external: ['popup'],
  methods: ['wallet_validatePassword', 'wallet_refetchTokenList'],
  db: ['setPassword', 'getUnlockReq', 'retract'],
}

export const main = async ({
  params: {password, waitSideEffects},
  db: {setPassword, retract, getUnlockReq},
  rpcs: {wallet_validatePassword, wallet_refetchTokenList},
  Err: {InvalidParams},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw InvalidParams('Invalid password')
  setPassword(password)

  const unlockReq = getUnlockReq() || []
  unlockReq.forEach(({req, eid}) => req.write(true).then(() => retract(eid)))

  let promise = wallet_refetchTokenList()
  if (waitSideEffects) await promise
}
