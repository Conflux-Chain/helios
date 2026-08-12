import {Bytes, Uint, dbid, ethHexAddress, map} from '@fluent-wallet/spec'

export const NAME = 'wallet_submitSponsoredTransaction'

const callSchema = [
  map,
  {closed: true},
  ['to', ethHexAddress],
  ['value', {optional: true}, Uint],
  ['data', {optional: true}, Bytes],
]

export const schemas = {
  input: [
    map,
    {closed: true},
    ['accountId', dbid],
    ['networkId', dbid],
    ['call', callSchema],
  ],
}

export const permissions = {
  external: [],
  methods: ['wallet_sendUserOperation', 'wallet_handleUserOperation'],
  db: [],
}

export const main = async ({
  Err: {Server},
  rpcs: {wallet_sendUserOperation, wallet_handleUserOperation},
  params: {accountId, networkId, call},
}) => {
  const {userOpHash} = await wallet_sendUserOperation(
    {errorFallThrough: true},
    {
      accountId,
      networkId,
      calls: [call],
    },
  )

  const result = await wallet_handleUserOperation(
    {errorFallThrough: true},
    {
      hash: userOpHash,
      networkId,
    },
  )

  if (!result?.transactionHash) {
    throw Server('UserOperation did not produce a transaction hash')
  }

  return result.transactionHash
}
