import {
  mapp,
  dbid,
  map,
  truep,
  maybe,
  enums,
  or,
  cat,
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
          [cat, [oneOrMore, AccountGroupTypeSchema]],
        ],
      ],
      ['g', {optional: true}, mapp],
    ],
  ],
}

export const permissions = {
  db: ['findGroup'],
  external: ['popup'],
}

export const main = ({Err: {InvalidParams}, params = {}, db: {findGroup}}) => {
  const {accountGroupId, includeHidden, type, g} = params
  const types = new Set()
  if (Array.isArray(type)) {
    if (type.length > 4) throw InvalidParams(`Invalid type: ${type}`)
    type.forEach(t => types.add(t))
    if (types.size !== type.length)
      throw InvalidParams(`Invalid type: ${type}, duplicate value`)
  } else if (type) {
    types.add(type)
  }
  const query = {}
  if (types.size) query.types = Array.from(types)
  if (accountGroupId) query.groupId = accountGroupId
  if (!includeHidden) query.hidden = false
  if (g) query.g = g

  const accoungGroup = findGroup(query) || []

  return accoungGroup
}
