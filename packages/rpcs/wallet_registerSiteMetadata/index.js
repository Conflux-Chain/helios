import {map, stringp, url} from '@cfxjs/spec'

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
  methods: [],
  db: ['t'],
  scope: null,
}

export const main = ({
  Err: {InvalidRequest},
  db: {t},
  params: {name, icon},
  _inpage,
  _origin,
  _post,
  network,
}) => {
  if (_inpage && !_origin) throw InvalidRequest(`no origin found`)
  t([
    {eid: 'newsite', site: {name, origin: _origin, post: _post}},
    icon && {eid: 'newsite', site: {icon}},
  ])

  _post({
    event: 'connect',
    params: {chainId: network.chainId, networkId: network.netId},
  })

  return
}
