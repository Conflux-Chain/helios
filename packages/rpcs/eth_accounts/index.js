import {optParam} from '@fluent-wallet/spec'

export const NAME = 'eth_accounts'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  methods: ['eth_requestAccounts'],
  db: [],
}

export const main = async ({rpcs: {eth_requestAccounts}, app}) => {
  if (!app) return []
  return await eth_requestAccounts()
}
