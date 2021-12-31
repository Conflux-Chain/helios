import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_getCurrentViewingApp'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['getAppBySite', 'getSiteByOrigin'],
}

export const main = async ({db: {getAppBySite, getSiteByOrigin}}) => {
  let t
  try {
    const {tab} = await import('@fluent-wallet/webextension')
    t = await tab.getCurrent()
    if (!t?.length) return null
    t = t[0]
    if (!t?.url) return null
  } catch (err) {
    return null
  }

  const urlSplit = t.url.split('/')
  const origin = urlSplit[2]
  const [site] = getSiteByOrigin(origin)
  if (!site) return null

  const [app] = getAppBySite(site.eid)

  return {site, app}
}
