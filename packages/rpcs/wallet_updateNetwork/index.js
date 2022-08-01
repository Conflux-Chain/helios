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
  if (network.builtin && network.endpoint === params.rpcUrls[0])
    throw InvalidParams(`Don't support update builtin network`)

  let newParams
  // only allow changing builtin network's rpcUrls
  if (network.builtin) {
    newParams = {
      rpcUrls: params.rpcUrls,

      chainId: network.chainId,
      chainName: network.name,
      nativeCurrency: {...network.ticker},
      blockExplorerUrls: [network.scanUrl],
      iconUrls: [network.icon],
      hdPath: network.hdPath.eid,
    }
  } else {
    // eslint-disable-next-line no-unused-vars
    let {networkId, ...newParams1} = params
    newParams = newParams1
  }

  return wallet_addNetwork({toUpdateNetwork: network}, newParams)
}
