import {Bytes, cat} from '@fluent-wallet/spec'

export const NAME = 'eth_sendRawTransaction'

export const schemas = {
  input: [cat, Bytes],
}

export const permissions = {
  external: [],
  locked: true,
  methods: [],
  db: [],
}

export const main = async ({f, params}) => {
  return await f(params)
}
