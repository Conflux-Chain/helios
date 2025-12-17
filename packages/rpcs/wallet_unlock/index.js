import {map, password, truep} from '@fluent-wallet/spec'
import {siteRuntimeManager} from '@fluent-wallet/site-runtime-manager'

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
  methods: ['wallet_afterUnlock', 'wallet_validatePassword'],
  db: ['setPassword', 'getUnlockReq', 'retract', 'findApp', 'findAddress'],
}

export const main = async ({
  params: {password, waitSideEffects},
  db: {setPassword, retract, getUnlockReq, findApp, findAddress},
  rpcs: {wallet_validatePassword, wallet_afterUnlock},
  Err: {InvalidParams},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw InvalidParams('Invalid password')
  setPassword(password)

  const unlockReq = getUnlockReq() || []
  unlockReq.forEach(({req, eid}) => req.write(true).then(() => retract(eid)))

  const apps = findApp({
    g: {currentNetwork: {eid: 1}, currentAccount: {eid: 1}, site: {origin: 1}},
  })
  apps.forEach(app => {
    if (!app?.site?.origin) return
    const {
      site: {origin},
      currentAccount: {eid: accountId},
      currentNetwork: {eid: networkId},
    } = app
    try {
      const addr = findAddress({accountId, networkId, g: {value: 1}})
      if (!addr) return
      const posts = siteRuntimeManager.getPosts(origin) || []
      posts.forEach(post => {
        post({
          event: 'accountsChanged',
          params: [addr.value],
        })
      })
      // eslint-disable-next-line no-empty
    } catch (err) {}
  })

  await wallet_afterUnlock({waitSideEffects: Boolean(waitSideEffects)})
}
