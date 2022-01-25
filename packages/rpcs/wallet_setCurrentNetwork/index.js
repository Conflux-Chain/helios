import {dbid, oneOrMore} from '@fluent-wallet/spec'
import {Sentry} from '@fluent-wallet/sentry'

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
    apps.map(async app =>
      wallet_setAppCurrentNetwork(
        {network},
        {appId: app.eid, networkId: networkId},
      ),
    ),
  )

  Sentry.setTag('current_network', nextNetwork.name)
}
