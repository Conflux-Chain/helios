import {map, password} from '@cfxjs/spec'

export const NAME = 'wallet_unlock'

export const schema = {
  input: [map, ['password', password]],
}

export const permissions = {
  methods: ['wallet_validatePassword'],
  db: ['setPassword'],
}

export const main = async ({
  params: {password},
  db: {setPassword},
  rpcs: {wallet_validatePassword},
  Err,
} = {}) => {
  if (!(await wallet_validatePassword({password})))
    throw new Err('Invalid password')
  setPassword(password)
}
