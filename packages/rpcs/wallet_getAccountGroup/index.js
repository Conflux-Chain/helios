import {dbid, map, truep, maybe, enums} from '@cfxjs/spec'

export const NAME = 'wallet_getAccountGroup'

export const schemas = {
  input: [
    maybe,
    [
      map,
      {closed: true},
      ['accountGroupId', {optional: true}, dbid],
      ['includeHidden', {optional: true}, truep],
      ['type', {optional: true}, [enums, 'hd', 'pk', 'pub']],
    ],
  ],
}

export const permissions = {
  db: ['getAccountGroup'],
  external: ['popup'],
}

export const main = ({params = {}, db: {getAccountGroup}}) => {
  const {accountGroupId, includeHidden, type} = params
  const query = {}
  if (accountGroupId) query.eid = accountGroupId
  if (includeHidden) query.hidden = true

  const accoungGroup = getAccountGroup(query) || []

  if (type) return accoungGroup.filter(g => g.vault.type === type)

  return accoungGroup
}
