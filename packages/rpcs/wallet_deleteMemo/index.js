import {dbid, map} from '@fluent-wallet/spec'

export const NAME = 'wallet_deleteMemo'

export const schemas = {
  input: [map, {closed: true}, ['memoId', dbid]],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['retract', 'getMemoById'],
}

export const main = ({
  Err: {InvalidParams},
  db: {retract, getMemoById},
  params: {memoId},
}) => {
  if (!getMemoById(memoId)) throw InvalidParams(`Invalid memo id ${memoId}`)
  retract(memoId)

  return
}
