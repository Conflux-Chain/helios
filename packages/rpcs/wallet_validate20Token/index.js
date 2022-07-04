import {
  or,
  base32ContractAddress,
  base32UserAddress,
  dbid,
  ethHexAddress,
  integer,
  map,
  stringp,
  tokenSymbol,
  truep,
} from '@fluent-wallet/spec'
import {decode} from '@fluent-wallet/base32-address'
import {validateTokenInfo} from '@fluent-wallet/contract-abis/777.js'

export const NAME = 'wallet_validate20Token'

export const schemas = {
  input: [
    map,
    ['tokenAddress', [or, base32ContractAddress, ethHexAddress]],
    ['name', {optional: true}, stringp],
    ['symbol', {optional: true}, tokenSymbol],
    ['decimals', {optional: true}, integer],
    ['userAddress', {optional: true}, [or, base32UserAddress, ethHexAddress]],
    ['addressId', {optional: true}, dbid],
    ['selectedAccountAddress', {optional: true}, truep],
  ],
}

export const permissions = {
  locked: true,
  external: ['popup', 'inpage'],
  methods: ['cfx_call', 'eth_call'],
  db: ['getCurrentAddr', 'getAddressById'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getCurrentAddr, getAddressById},
  rpcs: {cfx_call, eth_call},
  params: {
    name,
    symbol,
    decimals,
    tokenAddress,
    userAddress,
    addressId,
    selectedAccountAddress,
  },
  network: {type},
}) => {
  if (
    (addressId && userAddress) ||
    (addressId && selectedAccountAddress) ||
    (userAddress && selectedAccountAddress)
  )
    throw InvalidParams(
      `don't support providing userAddress addressId selectedAccountAddress at the same time`,
    )

  let uaddr
  if (addressId) {
    const addr = getAddressById(addressId)
    if (!addr) throw InvalidParams(`Invalid addressId ${addressId}`)
    uaddr = addr.hex
  }
  if (userAddress && type === 'cfx') uaddr = decode(userAddress).hexAddress
  if (userAddress && type === 'eth') uaddr = userAddress
  if (selectedAccountAddress) uaddr = getCurrentAddr().hex

  const call = type === 'cfx' ? cfx_call : eth_call
  const rst = await validateTokenInfo(
    d => call({errorFallThrough: true}, [d]),
    {name, decimals, symbol, address: tokenAddress, userAddress: uaddr},
  )

  return rst
}
