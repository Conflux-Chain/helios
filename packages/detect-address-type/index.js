import {decode} from '@fluent-wallet/base32-address'
import {isFunction} from '@fluent-wallet/checks'

export const detectCfxAddressType = async address => {
  const isBase32 = address.includes(':')

  if (isBase32) {
    const type = decode(address).type
    return {type, [type]: true}
  }

  throw new Error(`don't support detect hex address with cfx network`)
}

export const detectEthAddressType = async (address, {request} = {}) => {
  if (!isFunction(request)) throw new Error('opts.request is not a function')

  let rst
  try {
    rst = await request({method: 'eth_getCode', params: [address]})
  } catch (err) {} // eslint-disable-line no-empty

  if (!rst || rst === '0x') return {type: 'unknown', contract: false}
  return {type: 'contract', contract: true}
}

export const detectAddressType = async (address, opts = {}) => {
  if (opts.type === 'cfx') return await detectCfxAddressType(address)
  if (opts.type === 'eth') return await detectEthAddressType(address, opts)
  throw new Error(`Invalid opts.type ${opts.type}, must be one of cfx or eth`)
}
