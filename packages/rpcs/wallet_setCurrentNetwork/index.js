import {dbid, oneOrMore} from '@fluent-wallet/spec'
import {Sentry} from '@fluent-wallet/sentry'

export const NAME = 'wallet_setCurrentNetwork'

export const schemas = {
  input: [oneOrMore, dbid],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['setCurrentNetwork', 'getNetworkById', 'getSite'],
}

export const main = ({
  Err: {InvalidParams},
  db: {setCurrentNetwork, getNetworkById, getSite},
  params: networks,
}) => {
  const [networkId] = networks
  const network = getNetworkById(networkId)
  if (!network) throw InvalidParams(`Invalid networkId ${networkId}`)

  setCurrentNetwork(networkId)
  getSite().forEach(
    ({post}) =>
      post &&
      post({
        event: 'chainChanged',
        params: network.chainId,
      }),
  )
  Sentry.setTag('current_network', network.name)
}
