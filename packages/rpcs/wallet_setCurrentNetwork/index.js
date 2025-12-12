import {dbid, oneOrMore} from '@fluent-wallet/spec'
import {siteRuntimeManager} from '@fluent-wallet/site-runtime-manager'

export const NAME = 'wallet_setCurrentNetwork'

export const schemas = {
  input: [oneOrMore, dbid],
}

export const permissions = {
  external: ['popup'],
  methods: ['wallet_setAppCurrentNetwork'],
  db: [
    'setCurrentNetwork',
    'getNetworkById',
    'getAppsWithDifferentSelectedNetwork',
  ],
}

export const main = async ({
  Err: {InvalidParams},
  db: {setCurrentNetwork, getNetworkById, getAppsWithDifferentSelectedNetwork},
  rpcs: {wallet_setAppCurrentNetwork},
  params: networks,
  network,
}) => {
  const [networkId] = networks
  const nextNetwork = getNetworkById(networkId)
  if (!nextNetwork) throw InvalidParams(`Invalid networkId ${networkId}`)
  const apps = getAppsWithDifferentSelectedNetwork(networkId)

  setCurrentNetwork(networkId)

  await Promise.all(
    apps.map(async app => {
      await wallet_setAppCurrentNetwork(
        {network},
        {appId: app.eid, networkId: networkId},
      )
      return true
    }),
  )

  // get all connected sites
  const origins = siteRuntimeManager.getAllOrigins()
  origins.forEach(o => {
    // site with app bound will be notified by wallet_setAppCurrentNetwork, no need to handle here
    if (apps.some(app => app.site.origin === o)) return
    const posts = siteRuntimeManager.getPosts(o) || []
    posts.forEach(post => {
      post({event: 'chainChanged', params: nextNetwork.chainId})
    })
  })
}
