import {
  base32Address,
  dbid,
  ethHexAddress,
  map,
  string,
} from '@fluent-wallet/spec'

import {validateBase32Address} from '@fluent-wallet/base32-address'

export const NAME = 'wallet_upsertMemo'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['address', base32Address, ethHexAddress],
    ['value', [string, {min: 1}]],
    ['memoId', {optional: true}, dbid],
  ],
}

export const permissions = {
  external: ['popup'],
  db: ['getMemoById', 'getOneMemo', 'getAddressByValue', 't'],
}

export const main = ({
  Err: {InvalidParams},
  db: {getMemoById, getOneMemo, t},
  params: {address, value, memoId},
  network,
}) => {
  if (memoId && !getMemoById(memoId))
    throw InvalidParams(`Invalid memo id ${memoId}`)
  if (getOneMemo({id: [address, value]})) return

  const isBase32 = validateBase32Address(address)

  if (network.type === 'cfx' && !isBase32)
    throw InvalidParams(`Invalid address ${address}, not valid base32`)

  if (network.type === 'eth' && isBase32)
    throw InvalidParams(`Invalid address ${address}, not valid hex address`)

  if (memoId) {
    t([{eid: memoId, memo: {address, value, type: network.type}}])
  } else {
    t([
      {
        eid: `memo-${address}-${value}`,
        memo: {address, value, type: network.type},
      },
    ])
  }
}
