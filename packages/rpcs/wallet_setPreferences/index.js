import {map, boolean} from '@fluent-wallet/spec'
import {isUndefined} from '@fluent-wallet/checks'

export const NAME = 'wallet_setPreferences'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['hideTestNetwork', {optional: true}, boolean],
    ['useModernProviderAPI', {optional: true}, boolean],
  ],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['setPreferences', 'getApp'],
}

export const main = ({db: {setPreferences, getApp}, params}) => {
  const txRst = setPreferences(params)

  if (!isUndefined(params?.useModernProviderAPI)) {
    const apps = getApp()
    apps.forEach(app => {
      if (!app.site.post) return
      app.site.post({
        event: '__FLUENT_USE_MODERN_PROVIDER_API__',
        params: params.useModernProviderAPI,
      })
    })
  }

  return txRst
}
