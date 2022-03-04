import {map, stringp, url} from '@fluent-wallet/spec'

export const NAME = 'wallet_registerSiteMetadata'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['name', stringp],
    ['icon', {optional: true}, url],
  ],
}

export const permissions = {
  external: ['inpage'],
  locked: true,
  methods: ['wallet_requestPermissions'],
  db: ['t', 'findAccount'],
  scope: null,
}

export const main = ({
  Err: {InvalidRequest},
  db: {t, findAccount},
  rpcs: {wallet_requestPermissions},
  params: {name, icon},
  _inpage,
  _origin,
  _post,
  network,
}) => {
  if (_inpage && !_origin) throw InvalidRequest(`no origin found`)
  const {tempids} = t([
    {eid: 'newsite', site: {name, origin: _origin, post: _post}},
    icon && {eid: 'newsite', site: {icon}},
  ])

  // wallet_getPreferences().then(p => {
  //   const {
  //     useModernProviderAPI,
  //     overrideWindowDotConflux,
  //     overrideWindowDotEthereum,
  //   } = p
  //   return _post({
  //     event: '__FLUENT_BACKEND_PREFERENCES__',
  //     params: {
  //       useModernProviderAPI,
  //       overrideWindowDotConflux,
  //       overrideWindowDotEthereum,
  //     },
  //   })
  // })

  _post({
    event: 'connect',
    params: {chainId: network.chainId, networkId: network.netId},
  })

  // auto authed app
  // x.fluentwallet.com
  // x-x.fluentwallet.com
  // x.x.fluentwallet.com
  if (
    tempids.newsite &&
    (/^[a-zA-Z0-9-]+\.fluentwallet\.com$/.test(_origin) ||
      /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.fluentwallet\.com$/.test(_origin))
  ) {
    wallet_requestPermissions(
      {_popup: true, network},
      {
        siteId: tempids.newsite,
        permissions: [{wallet_accounts: {}}],
        accounts: findAccount(),
      },
    )
  }

  return
}
