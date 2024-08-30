import {dbid, oneOrMore} from '@fluent-wallet/spec'

export const NAME = 'wallet_setCurrentNetwork'

export const schemas = {
  input: [oneOrMore, dbid],
}

export const permissions = {
  external: ['popup'],
  methods: ['wallet_setAppCurrentNetwork', 'wallet_requestPermissions'],
  db: [
    'setCurrentNetwork',
    'getNetworkById',
    'getAppsWithDifferentSelectedNetwork',
    'getConnectedSitesWithoutApps',
  ],
}

function shouldGivenCrossNetworkAddressLookupPermissonsBasedOnNetworkChange(
  currentNetwork,
  nextNetwork,
) {
  if (currentNetwork.type === nextNetwork.type) return false
  if (nextNetwork.type === 'cfx')
    return 'wallet_crossNetworkTypeGetConfluxBase32Address'
  if (nextNetwork.type === 'eth')
    return 'wallet_crossNetworkTypeGetEthereumHexAddress'
  return false
}

export const main = async ({
  Err: {InvalidParams},
  db: {
    setCurrentNetwork,
    getNetworkById,
    getAppsWithDifferentSelectedNetwork,
    getConnectedSitesWithoutApps,
  },
  rpcs: {wallet_setAppCurrentNetwork, wallet_requestPermissions},
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
      const newPerm =
        shouldGivenCrossNetworkAddressLookupPermissonsBasedOnNetworkChange(
          app.currentNetwork,
          nextNetwork,
        )
      if (newPerm && !app.perms[newPerm]) {
        await wallet_requestPermissions(
          {
            _popup: true,
          },
          {
            siteId: app.site.eid,
            permissions: [{...app.perms, [newPerm]: {}}],
            accounts: app.account.map(a => a.eid),
          },
        )
      }
      await wallet_setAppCurrentNetwork(
        {network},
        {appId: app.eid, networkId: networkId},
      )
      return true
    }),
  )

  getConnectedSitesWithoutApps().forEach(site => {
    site.post({event: 'chainChanged', params: nextNetwork.chainId})
  })
}
