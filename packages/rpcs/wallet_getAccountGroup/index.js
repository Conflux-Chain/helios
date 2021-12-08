import {
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
    ],
  ],
}

export const permissions = {
  db: ['getAccountGroup'],
  external: ['popup'],
}

export const main = ({
  Err: {InvalidParams},
  params = {},
  db: {getAccountGroup},
}) => {
  const {accountGroupId, includeHidden, type} = params
  const types = new Set()
  if (Array.isArray(type)) {
    if (type.length > 3) throw InvalidParams(`Invalid type: ${type}`)
    type.forEach(t => types.add(t))
    if (types.size !== type.length)
      throw InvalidParams(`Invalid type: ${type}, duplicate value`)
  } else if (type) {
    types.add(type)
  }
  const query = {}
  if (accountGroupId) query.eid = accountGroupId

  const accoungGroup = getAccountGroup(query) || []

  const notype = !types.size
  return accoungGroup.reduce((acc, g) => {
    if (notype || types.has(g.vault.type)) {
      if (includeHidden) return acc.concat(g)
      return g.hidden ? acc : acc.concat(g)
    }
    return acc
  }, [])
}
