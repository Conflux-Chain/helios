import {map, password} from '@cfxjs/spec'
import {encrypt} from 'browser-passworder'

export const NAME = 'wallet_exportAll'

export const schemas = {
  inputs: [
    map,
    {closed: true},
    ['password', password],
    ['encryptPassword', password],
  ],
}

export const permissions = {
  external: ['popup'],
  methods: ['wallet_validatePassword'],
  db: ['getNetwork', 'getAccountGroup', 'getExportAllData'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getExportAllData},
  rpcs: {wallet_validatePassword},
  params: {password, encryptPassword},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw InvalidParams('Invalid password')

  return {
    encrypted: await encrypt(
      encryptPassword,
      JSON.stringify(getExportAllData()),
    ),
    wallet: 'fluent',
    version: '0',
  }
}
