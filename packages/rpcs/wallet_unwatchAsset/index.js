import {dbid, map} from '@fluent-wallet/spec'

export const NAME = 'wallet_unwatchAsset'

export const schemas = {
  input: [map, {closed: true}, ['tokenId', dbid], ['addressId', dbid]],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['retractAddressToken', 'getAddressById', 'getTokenById'],
}

export const main = ({
  Err: {InvalidParams},
  db: {retractAddressToken, getAddressById, getTokenById},
  params: {tokenId, addressId},
}) => {
  if (!getTokenById(tokenId)) throw InvalidParams(`Invalid tokenId ${tokenId}`)
  if (!getAddressById(addressId))
    throw InvalidParams(`Invalid addressId ${addressId}`)
  const rst = retractAddressToken({tokenId, addressId})
  if (rst === 'tokenNotBelongToAddress')
    throw InvalidParams(
      `Token [${tokenId}] not belong to address [${addressId}]`,
    )
  return true
}
