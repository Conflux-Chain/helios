import {nul, or, and, empty, arrp} from '@fluent-wallet/spec'
import {tab} from '@fluent-wallet/webextension'

export const NAME = 'wallet_getCurrentViewingApp'

export const schemas = {
  input: [or, nul, [and, arrp, empty]],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['getAppBySite', 'getSiteByOrigin'],
}

export const main = async ({db: {getAppBySite, getSiteByOrigin}}) => {
  let t
  try {
    await tab.getCurrent()
    if (!t?.url) return null
  } catch (err) {
    return null
  }

  const site = getSiteByOrigin(t.url)
  if (!site) return null

  const app = getAppBySite(site.eid)

  return {site, app}
}
