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
  db: [
    'setPassword',
    'getUnlockReq',
    'retract',
    'getAccountGroup',
    'findApp',
    'findAddress',
  ],
}

export const main = async ({
  params: {password, waitSideEffects},
  db: {
    setPassword,
    retract,
    getUnlockReq,
    getAccountGroup,
    findApp,
    findAddress,
  },
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

  const apps = findApp({
    g: {currentNetwork: {eid: 1}, currentAccount: {eid: 1}, site: {post: 1}},
  })
  apps.forEach(app => {
    if (!app?.site?.post) return
    const {
      site: {post},
      currentAccount: {eid: accountId},
      currentNetwork: {eid: networkId},
    } = app
    try {
      const addr = findAddress({accountId, networkId, g: {value: 1}})[0]
      if (!addr) return
      post &&
        post({
          event: 'accountsChanged',
          params: [addr.value],
        })
      // eslint-disable-next-line no-empty
    } catch (err) {}
  })

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
