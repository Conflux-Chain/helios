import {
  base32Address,
  dbid,
  ethHexAddress,
  or,
  map,
  string,
} from '@fluent-wallet/spec'

import {validateBase32Address} from '@fluent-wallet/base32-address'

export const NAME = 'wallet_upsertMemo'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['address', [or, base32Address, ethHexAddress]],
    ['value', [string, {min: 1}]],
    ['memoId', {optional: true}, dbid],
  ],
}

export const permissions = {
  external: ['popup'],
  db: ['getMemoById', 'upsertMemo', 'findMemo'],
}

export const main = ({
  Err: {InvalidParams},
  db: {getMemoById, upsertMemo, findMemo},
  params: {address, value, memoId},
  network,
}) => {
  if (memoId && !getMemoById(memoId))
    throw InvalidParams(`Invalid memo id ${memoId}`)
  if (findMemo({networkId: network.eid, address, value}).length)
    throw InvalidParams(`Invalid duplicate memo`)

  const isBase32 = validateBase32Address(address)

  if (network.type === 'cfx' && !isBase32)
    throw InvalidParams(`Invalid address ${address}, not valid base32`)

  if (network.type === 'eth' && isBase32)
    throw InvalidParams(`Invalid address ${address}, not valid hex address`)

  address = address.toLowerCase()

  upsertMemo({address, value, memoId, networkId: network.eid})
  return
}
