import {map, boolean} from '@fluent-wallet/spec'
import {isUndefined} from '@fluent-wallet/checks'

export const NAME = 'wallet_setPreferences'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['hideTestNetwork', {optional: true}, boolean],
    ['overrideWindowDotEthereum', {optional: true}, boolean],
  ],
}

export const permissions = {
  external: ['popup'],
  methods: ['wallet_getPreferences'],
  db: ['setPreferences', 'getApp'],
}

export const main = async ({
  rpcs: {wallet_getPreferences},
  db: {setPreferences, getApp},
  params,
}) => {
  const txRst = setPreferences(params)

  const {overrideWindowDotEthereum} = await wallet_getPreferences()

  // if overrideWindowDotEthereum is set
  if (!isUndefined(params?.overrideWindowDotEthereum)) {
    const apps = getApp()
    apps.forEach(app => {
      if (!app.site.post) return
      app.site.post({
        event: '__FLUENT_BACKEND_PREFERENCES__',
        // don't pass all preferences to content script
        params: {overrideWindowDotEthereum},
      })
    })
  }

  return txRst
}
