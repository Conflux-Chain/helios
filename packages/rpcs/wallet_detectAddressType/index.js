import {map, or, base32Address, ethHexAddress} from '@fluent-wallet/spec'
import {decode} from '@fluent-wallet/base32-address'

export const NAME = 'wallet_detectAddressType'

export const schemas = {
  input: [map, {closed: true}, ['address', [or, base32Address, ethHexAddress]]],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: ['eth_getCode'],
  db: ['getTokenByAddress'],
}

export const main = async ({
  Err: {InvalidParams},
  rpcs: {eth_getCode},
  db: {getTokenByAddress},
  params: {address},
  network: {type},
}) => {
  if (getTokenByAddress(address).length > 0) return {type: 'contract'}
  const isBase32 = address.includes(':')
  if (isBase32) {
    return {type: decode(address).type}
  }

  if (type === 'cfx')
    throw InvalidParams(`don't support detect hex address with cfx network`)

  let rst
  try {
    rst = await eth_getCode({errorFallThrough: true}, [address])
  } catch (err) {} // eslint-disable-line no-empty

  if (!rst || rst === '0x') return {type: 'unknown', contract: false}
  return {type: 'contract'}
}
