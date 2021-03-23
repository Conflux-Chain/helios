import {map, password} from '@cfxjs/spec'

export const NAME = 'wallet_unlock'

export const schema = {
  input: [map, ['password', password]],
}

export const permissions = {
  methods: ['wallet_validatePassword'],
  store: {write: true},
}

export const main = async ({
  setWalletState,
  params: {password},
  rpcs: {wallet_validatePassword},
  Err,
} = {}) => {
  if (!(await wallet_validatePassword({password})))
    throw new Err('Invalid password')
  setWalletState({MemStore: {password, acc: 1}})
}
