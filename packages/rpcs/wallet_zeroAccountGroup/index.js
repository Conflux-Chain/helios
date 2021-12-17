import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_zeroAccountGroup'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup'],
  locked: true,
  db: ['findGroup'],
}

export const main = ({db: {findGroup}}) => !findGroup()?.length
