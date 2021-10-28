import {optParam} from '@fluent-wallet/spec'

export const NAME = 'cfx_accounts'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  methods: ['cfx_requestAccounts'],
  db: [],
}

export const main = async ({rpcs: {cfx_requestAccounts}, app}) => {
  if (!app) return []
  return await cfx_requestAccounts()
}
