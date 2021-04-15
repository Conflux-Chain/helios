import {or, map, networkId, addressType, truep} from '@cfxjs/spec'
import {randomBase32Address} from '@cfxjs/base32-address'

import {randomHexAddress, randomCfxHexAddress} from '@cfxjs/account'

const base = [map, {closed: true}]
const hex = ['hex', truep]
const base32 = ['base32', truep]
const addrType = ['type', addressType]
const cfx = ['cfx', {optional: true}, truep]
const ethAddressSchema = [...base, hex, ['eth', truep]]
const cfxHexAddressSchema = [...base, hex, cfx, addrType]
const cfxBase32AddressSchema = [
  ...base,
  base32,
  cfx,
  addrType,
  ['networkId', networkId],
]

export const schemas = {
  input: [or, ethAddressSchema, cfxHexAddressSchema, cfxBase32AddressSchema],
}

const genRandomCfxHexAddress = type => {
  if (!type) return randomCfxHexAddress()
  return randomHexAddress(type)
}

export const main = function ({params: {eth, base32, hex, networkId, type}}) {
  if (eth) return randomHexAddress()
  if (hex) return genRandomCfxHexAddress(type)
  if (base32) return randomBase32Address(type, networkId)
}
