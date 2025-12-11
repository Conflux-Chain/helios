import {map, stringp, url} from '@fluent-wallet/spec'
import {siteRuntimeManager} from '@fluent-wallet/site-runtime-manager'

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
  db: ['t'],
  scope: null,
}

export const main = ({
  Err: {InvalidRequest},
  db: {t},
  rpcs: {wallet_getPreferences},
  params: {name, icon},
  _inpage,
  _origin,
  _post,
  _sender,
  network,
}) => {
  if (_inpage && !_origin) throw InvalidRequest(`no origin found`)

  // 在内存中注册 post 函数
  _sender?.tab?.id &&
    siteRuntimeManager.addPostListener(_origin, {
      post: _post,
      tabId: _sender.tab.id,
    })

  // 只保存可序列化的数据到数据库
  t([
    {eid: 'newsite', site: {name, origin: _origin}},
    icon && {eid: 'newsite', site: {icon}},
  ])

  wallet_getPreferences().then(p => {
    const {overrideWindowDotEthereum} = p
    return _post({
      event: '__FLUENT_BACKEND_PREFERENCES__',
      params: {
        overrideWindowDotEthereum,
      },
    })
  })

  _post({
    event: 'connect',
    params: {chainId: network.chainId, networkId: network.netId},
  })

  return
}
