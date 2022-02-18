import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_accounts'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: ['cfx_accounts', 'eth_accounts'],
  db: [],
}

export const main = ({rpcs: {cfx_accounts, eth_accounts}, network: {type}}) => {
  if (type === 'cfx') {
    return cfx_accounts()
  } else {
    return eth_accounts()
  }
}
