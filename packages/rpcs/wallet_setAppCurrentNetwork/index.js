import {map, dbid} from '@fluent-wallet/spec'
import {siteRuntimeManager} from '@fluent-wallet/site-runtime-manager'

export const NAME = 'wallet_setAppCurrentNetwork'

export const schemas = {
  input: [map, {closed: true}, ['appId', dbid], ['networkId', dbid]],
}

export const permissions = {
  external: ['popup'],
  methods: ['wallet_deleteApp', 'wallet_setAppCurrentAccount'],
  db: [
    'getNetworkById',
    'getAppById',
    't',
    'accountAddrByNetwork',
    'getAppAnotherAuthedNoneHWAccount',
  ],
}

export const main = async ({
  Err: {InvalidParams},
  db: {
    getNetworkById,
    getAppById,
    t,
    accountAddrByNetwork,
    getAppAnotherAuthedNoneHWAccount,
  },
  rpcs: {wallet_deleteApp, wallet_setAppCurrentAccount},
  params: {appId, networkId},
  network,
}) => {
  const nextNetwork = getNetworkById(networkId)
  if (!nextNetwork) throw InvalidParams(`Invalid network ${networkId}`)
  const app = getAppById(appId)
  if (!app) throw InvalidParams(`Invalid app id ${appId}`)

  t([{eid: app.eid, app: {currentNetwork: networkId}}])

  const {origin} = app.site

  if (!origin) return

  const posts = siteRuntimeManager.getPosts(origin) || []
  posts.forEach(post => {
    post({event: 'chainChanged', params: nextNetwork.chainId})
    post({
      event: 'connect',
      params: {chainId: nextNetwork.chainId, networkId: nextNetwork.netId},
    })
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
    //sometimes, if you authorize a hardware ledger account under ethereum to dapp, when you switch to conflux network, you cannot get addr
    if (!addr) {
      const anotherAccId = getAppAnotherAuthedNoneHWAccount({appId: app.eid})
      if (anotherAccId) {
        await wallet_setAppCurrentAccount({
          accountId: anotherAccId,
          appId: app.eid,
        })
      } else {
        await wallet_deleteApp({appId: app.eid})
      }
      return
    }
    posts.forEach(post => {
      post({event: 'accountsChanged', params: [addr.value]})
    })
  }
}
