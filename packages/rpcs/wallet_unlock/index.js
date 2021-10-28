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
  methods: [
    'wallet_validatePassword',
    'wallet_refetchTokenList',
    'wallet_refetchBalance',
    'wallet_discoverAccounts',
  ],
  db: ['setPassword', 'getUnlockReq', 'retract', 'getAccountGroup'],
}

export const main = async ({
  params: {password, waitSideEffects},
  db: {setPassword, retract, getUnlockReq, getAccountGroup},
  rpcs: {
    wallet_discoverAccounts,
    wallet_validatePassword,
    wallet_refetchTokenList,
    wallet_refetchBalance,
  },
  Err: {InvalidParams},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw InvalidParams('Invalid password')
  setPassword(password)

  const unlockReq = getUnlockReq() || []
  unlockReq.forEach(({req, eid}) => req.write(true).then(() => retract(eid)))

  let promise = wallet_refetchTokenList()
    .then(() =>
      Promise.all(
        getAccountGroup().map(({eid}) =>
          wallet_discoverAccounts({accountGroupId: eid, waitTillFinish: true}),
        ),
      ),
    )
    .then(() => wallet_refetchBalance({type: 'all', allNetwork: true}))
  if (waitSideEffects) await promise
}
