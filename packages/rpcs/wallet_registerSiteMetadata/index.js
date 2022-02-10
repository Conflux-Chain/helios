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
  methods: ['wallet_requestPermissions', 'wallet_getPreferences'],
  db: ['t', 'findAccount'],
  scope: null,
}

export const main = ({
  Err: {InvalidRequest},
  db: {t, findAccount},
  rpcs: {wallet_requestPermissions, wallet_getPreferences},
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

  wallet_getPreferences().then(p =>
    _post({
      event: '__FLUENT_USE_MODERN_PROVIDER_API__',
      params: p?.useModernProviderAPI,
    }),
  )

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
