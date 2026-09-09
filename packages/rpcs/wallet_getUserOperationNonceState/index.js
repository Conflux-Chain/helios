import {EIP7702_NETWORK_CONFIGS} from '@fluent-wallet/consts'
import {cat, ethHexAddress} from '@fluent-wallet/spec'
import {
  decodeGetNonceResult,
  encodeGetNonceCall,
} from '@fluent-wallet/user-operation'

export const NAME = 'wallet_getUserOperationNonceState'

export const schemas = {
  input: [cat, ethHexAddress],
}

export const permissions = {
  methods: ['eth_call'],
  db: ['getOccupiedUserOperationNonces'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getOccupiedUserOperationNonces},
  rpcs: {eth_call},
  params: [sender],
  network,
}) => {
  const {entryPointAddress} = EIP7702_NETWORK_CONFIGS[network.chainId] || {}
  if (!entryPointAddress) {
    throw InvalidParams(
      `UserOperation is not supported on network ${network.name}`,
    )
  }

  const lowercaseSender = sender.toLowerCase()
  const encodedNonce = await eth_call({errorFallThrough: true}, [
    {
      to: entryPointAddress,
      data: encodeGetNonceCall(lowercaseSender),
    },
    'latest',
  ])

  return {
    networkPendingNonce: decodeGetNonceResult(encodedNonce),
    occupiedNonces: getOccupiedUserOperationNonces({
      sender: lowercaseSender,
      chainId: network.chainId,
      entryPoint: entryPointAddress,
    }),
  }
}
