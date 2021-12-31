import {map, dbid} from '@fluent-wallet/spec'

export const NAME = 'wallet_setAppCurrentNetwork'

export const schemas = {
  input: [map, {closed: true}, ['appId', dbid], ['networkId', dbid]],
}

export const permissions = {
  external: ['popup'],
  db: ['getNetworkById', 'getAppById', 't'],
}

export const main = ({
  Err: {InvalidParams},
  db: {getNetworkById, getAppById, t},
  params: {appId, networkId},
}) => {
  const network = getNetworkById(networkId)
  if (!network) throw InvalidParams(`Invalid network ${networkId}`)
  const app = getAppById(appId)
  if (!app) throw InvalidParams(`Invalid app id ${appId}`)

  t([{eid: app.eid, app: {currentNetwork: networkId}}])

  const {post} = app.site
  if (post) post({event: 'chainChanged', params: network.chainId})
}
