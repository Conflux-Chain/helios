import {
  dbid,
  map,
  truep,
  maybe,
  enums,
  or,
  set,
  oneOrMore,
} from '@fluent-wallet/spec'

export const NAME = 'wallet_getAccountGroup'

const AccountGroupTypeSchema = [enums, 'hd', 'pk', 'pub']

export const schemas = {
  input: [
    maybe,
    [
      map,
      {closed: true},
      ['accountGroupId', {optional: true}, dbid],
      ['includeHidden', {optional: true}, truep],
      [
        'type',
        {optional: true},
        [
          or,
          AccountGroupTypeSchema,
          [set, [oneOrMore, AccountGroupTypeSchema]],
        ],
      ],
    ],
  ],
}

export const permissions = {
  db: ['getAccountGroup'],
  external: ['popup'],
}

export const main = ({params = {}, db: {getAccountGroup}}) => {
  const {accountGroupId, includeHidden, type} = params
  let types = type
  if (typeof types === 'string') types = [types]
  const query = {}
  if (accountGroupId) query.eid = accountGroupId
  if (includeHidden) query.hidden = true

  const accoungGroup = getAccountGroup(query) || []

  if (type && type.length)
    return accoungGroup.reduce(
      (acc, g) => (type.includes(g.type) ? acc.concat(g) : acc),
      [],
    )

  return accoungGroup
}
