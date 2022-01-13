import {dbid, map, password} from '@fluent-wallet/spec'

export const NAME = 'wallet_deleteNetwork'

export const schemas = {
  input: [map, {closed: true}, ['password', password], ['networkId', dbid]],
}

export const permissions = {
  external: ['popup'],
  db: ['retractNetwork', 'getNetworkById', 'getNetwork'],
  methods: ['wallet_validatePassword', 'wallet_setCurrentNetwork'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getNetworkById, retractNetwork, getNetwork},
  rpcs: {wallet_validatePassword, wallet_setCurrentNetwork},
  params: {password, networkId},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw InvalidParams('Incorrect password')

  const network = getNetworkById(networkId)
  if (!network) throw InvalidParams(`Invalid network id ${networkId}`)
  if (network.builtin)
    throw InvalidParams(`Not allowed to delete builtin network`)

  if (network.selected) {
    const networks = getNetwork()
    // select the 'next' network of the to-b deleted one
    const nextNetwork = networks.reduce((_, n, idx) => {
      if (n.eid === networkId) return networks[idx + 1] || networks[0]
    }, undefined)
    await wallet_setCurrentNetwork({errorFallThrough: true}, [nextNetwork.eid])
  }
  retractNetwork({networkId})
  return true
}
