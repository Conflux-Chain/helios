import {map, enums, truep, dbid} from '@fluent-wallet/spec'

export const NAME = 'wallet_getNetwork'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['type', {optional: true}, [enums, 'cfx', 'eth']],
    ['builtin', {optional: true}, truep],
    ['networkId', {optional: true}, dbid],
  ],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['getNetwork', 'getNetworkById'],
}

export const main = ({
  Err: {InvalidParams},
  db: {getNetwork, getNetworkById},
  params: {type, builtin, networkId},
}) => {
  const hasNetworkId = Number.isInteger(networkId)
  if ((type && hasNetworkId) || (builtin && hasNetworkId))
    throw InvalidParams(
      "Can't query type/builtin with networkId at the same type",
    )
  if (hasNetworkId) return getNetworkById(networkId)

  const query = {}
  if (type) query.type = type
  if (builtin) query.builtin = builtin
  return getNetwork(query)
}
