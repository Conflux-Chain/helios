import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_requestAccounts'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['inpage'],
  locked: true,
  methods: ['cfx_requestAccounts', 'eth_requestAccounts'],
  db: [],
}

export const main = ({
  rpcs: {cfx_requestAccounts, eth_requestAccounts},
  network: {type},
}) => {
  if (type === 'cfx') return cfx_requestAccounts()
  return eth_requestAccounts()
}
