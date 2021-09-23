import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_zeroAccountGroup'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup'],
  locked: true,
  db: ['getAccountGroup'],
}

export const main = ({db: {getAccountGroup}}) => !getAccountGroup()?.length
