import {map, password} from '@cfxjs/spec'

export const NAME = 'wallet_unlock'

export const schemas = {
  input: [map, ['password', password]],
}

export const permissions = {
  locked: true,
  methods: ['wallet_validatePassword'],
  db: ['setPassword'],
}

export const main = async ({
  params: {password},
  db: {setPassword},
  rpcs: {wallet_validatePassword},
  Err,
}) => {
  if (!(await wallet_validatePassword({password})))
    throw Err.InvalidParams('Invalid password')
  setPassword(password)
}
