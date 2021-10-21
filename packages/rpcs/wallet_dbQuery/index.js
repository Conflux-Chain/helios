import {map, mapp, stringp} from '@fluent-wallet/spec'

export const NAME = 'wallet_dbQuery'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['method', stringp],
    ['params', {optional: true}, mapp],
  ],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: [],
}

export const main = ({Err: {InvalidParams}, db, params: {method, params}}) => {
  if (!db[method]) throw InvalidParams(`Invalid db query method ${method}`)
  return db[method](params)
}
