import {dbid} from '@fluent-wallet/spec'
import {ChainParameterSchema} from '@fluent-wallet/wallet_add-network'

export const NAME = 'wallet_updateNetwork'

export const schemas = [...ChainParameterSchema, ['networkId', dbid]]

export const permissions = {
  external: ['popup'],
  methods: ['wallet_addNetwork'],
  db: ['getNetworkById'],
}

export const main = ({
  Err: {InvalidParams},
  rpcs: {wallet_addNetwork},
  db: {getNetworkById},
  params,
}) => {
  const network = getNetworkById(params.networkId)
  if (!network) throw InvalidParams(`Invalid network id: ${params.networkId}`)
  if (network.builtin)
    throw InvalidParams(`Don't support update builtin network`)
  // eslint-disable-next-line no-unused-vars
  const {networkId, ...newParams} = params

  return wallet_addNetwork({toUpdateNetwork: network}, newParams)
}
