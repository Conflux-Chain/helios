import {cat, Hash32, boolean} from '@fluent-wallet/spec'

export const NAME = 'eth_getBlockByHash'

export const schemas = {
  input: [cat, Hash32, boolean],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: [],
  db: [],
}

export const main = ({f, params}) => {
  return f(params)
}
