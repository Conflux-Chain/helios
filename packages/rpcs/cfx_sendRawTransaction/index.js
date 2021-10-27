import {Bytes, cat} from '@fluent-wallet/spec'

export const NAME = 'cfx_sendRawTransaction'

export const schemas = {
  input: [cat, Bytes],
}

export const permissions = {
  external: [],
  methods: [],
  db: [],
}

export const main = async ({f, params}) => {
  return await f(params)
}
