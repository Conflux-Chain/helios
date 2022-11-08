import {
  map,
  enums,
  dbid,
  networkId,
  chainId,
  boolean,
  or,
  optParam,
} from '@fluent-wallet/spec'
import {isUndefined} from '@fluent-wallet/checks'

export const NAME = 'wallet_getNetwork'

export const schemas = {
  input: [
    or,
    [
      map,
      {closed: true},
      ['type', {optional: true}, [enums, 'cfx', 'eth']],
      ['builtin', {optional: true}, boolean],
      ['chainId', {optional: true}, chainId],
      ['networkId', {optional: true}, networkId],
      ['networkDbId', {optional: true}, dbid],
    ],
    optParam,
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
  params: {type, builtin, networkId, networkDbId, chainId} = {},
}) => {
  const networkDbIdDefined = !isUndefined(networkDbId)
  const builtinDefined = !isUndefined(builtin)
  const networkIdDefined = !isUndefined(networkId)
  if (
    (type || chainId || networkIdDefined || builtinDefined) &&
    networkDbIdDefined
  )
    throw InvalidParams(
      "Can't query type/builtin/chainId/networkId with networkDbId at the same time",
    )
  if (networkDbIdDefined) return getNetworkById(networkDbId)

  const query = {}
  if (type) query.type = type
  if (builtinDefined) query.builtin = builtin
  if (networkIdDefined) query.networkId = networkId
  if (chainId) query.chainId = chainId

  // network order:  mainnet -> testnet -> custom
  let ret = getNetwork(query)
  if (ret?.length > 0) {
    ret = ret.sort((a, b) => {
      if (a.isMainnet && b.isMainnet) {
        return 0
      }
      if (a.isMainnet && !b.isMainnet) {
        return -1
      }
      if (!a.isMainnet && b.isMainnet) {
        return 1
      }
      if (!a.isCustom && b.isCustom) {
        return -1
      }
      if (a.isCustom && !b.isCustom) {
        return 1
      }
      return 0
    })
  }
  return ret
}
