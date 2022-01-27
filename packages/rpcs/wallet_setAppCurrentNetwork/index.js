import {map, dbid} from '@fluent-wallet/spec'

export const NAME = 'wallet_setAppCurrentNetwork'

export const schemas = {
  input: [map, {closed: true}, ['appId', dbid], ['networkId', dbid]],
}

export const permissions = {
  external: ['popup'],
  db: ['getNetworkById', 'getAppById', 't', 'accountAddrByNetwork'],
}

export const main = ({
  Err: {InvalidParams},
  db: {getNetworkById, getAppById, t, accountAddrByNetwork},
  params: {appId, networkId},
  network,
}) => {
  const nextNetwork = getNetworkById(networkId)
  if (!nextNetwork) throw InvalidParams(`Invalid network ${networkId}`)
  const app = getAppById(appId)
  if (!app) throw InvalidParams(`Invalid app id ${appId}`)

  t([{eid: app.eid, app: {currentNetwork: networkId}}])

  const {post} = app.site

  if (!post) return

  post({event: 'chainChanged', params: nextNetwork.chainId})
  post({
    event: 'connect',
    params: {chainId: nextNetwork.chainId, networkId: nextNetwork.netId},
  })

  // fire accountsChanged event when
  // eth switch to cfx
  // cfx switch to eth
  // cfx to another cfx network
  if (network.type === 'cfx' || nextNetwork.type === 'cfx') {
    const addr = accountAddrByNetwork({
      account: app.currentAccount.eid,
      network: nextNetwork.eid,
    })
    post({event: 'accountsChanged', params: [addr.value]})
  }
}
