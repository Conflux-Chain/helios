import {siteRuntimeManager} from '@fluent-wallet/site-runtime-manager'

export const NAME = 'wallet_lock'

export const schemas = {}

export const permissions = {
  db: ['setLocked', 'findApp'],
  external: ['popup'],
}

export const main = async ({db: {setLocked, findApp}}) => {
  setLocked(true)
  const apps = findApp({g: {site: {origin: 1}}})
  apps.forEach(app => {
    try {
      const {
        site: {origin},
      } = app

      const posts = siteRuntimeManager.getPosts(origin) || []
      posts.forEach(post => {
        post({event: 'accountsChanged', params: []})
      })

      // eslint-disable-next-line no-empty
    } catch (err) {}
  })
}
