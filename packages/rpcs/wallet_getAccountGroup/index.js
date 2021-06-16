import {dbid, map, truep, maybe} from '@cfxjs/spec'

export const NAME = 'wallet_getAccountGroup'

export const schemas = {
  input: [
    maybe,
    [
      map,
      {closed: true},
      ['accountGroupId', {optional: true}, dbid],
      ['includeHidden', {optional: true}, truep],
    ],
  ],
}

export const permissions = {
  db: ['getAccountGroup'],
  external: ['popup'],
}

export const main = ({params = {}, db: {getAccountGroup}}) => {
  const {accountGroupId, includeHidden} = params
  const query = {}
  if (accountGroupId) query.eid = accountGroupId
  if (includeHidden) query.hidden = true

  return getAccountGroup(query)
}
