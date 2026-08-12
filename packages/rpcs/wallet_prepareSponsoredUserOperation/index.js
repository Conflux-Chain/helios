import {EIP7702_NETWORK_CONFIGS} from '@fluent-wallet/consts'
import {Bytes, Uint, ethHexAddress, map, oneOrMore} from '@fluent-wallet/spec'
import {
  decodeCanSponsorResult,
  encodeCanSponsorCall,
} from '@fluent-wallet/user-operation'

export const NAME = 'wallet_prepareSponsoredUserOperation'

const callSchema = [
  map,
  {closed: true},
  ['to', ethHexAddress],
  ['value', {optional: true}, Uint],
  ['data', {optional: true}, Bytes],
]

const authorizationSchema = [
  map,
  {closed: true},
  ['chainId', Uint],
  ['address', ethHexAddress],
  ['nonce', Uint],
]

export const schemas = {
  input: [
    map,
    {closed: true},
    ['sender', ethHexAddress],
    ['nonce', Uint],
    ['calls', [oneOrMore, callSchema]],
    ['authorization', {optional: true}, authorizationSchema],
  ],
}

export const permissions = {
  external: [],
  methods: ['eth_call', 'wallet_prepareUserOperation'],
  db: [],
}

export const main = async ({
  Err: {InvalidParams},
  rpcs: {eth_call, wallet_prepareUserOperation},
  params,
  network,
}) => {
  const networkConfig = EIP7702_NETWORK_CONFIGS[network.chainId]
  if (!networkConfig) {
    throw InvalidParams(
      `Sponsored UserOperation is not supported on network ${network.name}`,
    )
  }

  const {whitelistPaymasterAddress} = networkConfig

  const prepared = await wallet_prepareUserOperation(
    {
      errorFallThrough: true,
      network,
    },
    {
      ...params,
      paymaster: whitelistPaymasterAddress,
    },
  )

  const encodedSponsorship = await eth_call(
    {
      errorFallThrough: true,
      network,
      _cacheConf: {type: null},
    },
    [
      {
        to: whitelistPaymasterAddress,
        data: encodeCanSponsorCall(prepared.userOperation),
      },
      'latest',
    ],
  )

  return {
    ...prepared,
    sponsorship: decodeCanSponsorResult(encodedSponsorship),
  }
}
