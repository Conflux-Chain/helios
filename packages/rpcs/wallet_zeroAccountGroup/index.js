import {nul, or, and, empty, arrp} from '@fluent-wallet/spec'

export const NAME = 'wallet_zeroAccountGroup'

export const schemas = {
  input: [or, nul, [and, arrp, empty]],
}

export const permissions = {
  external: ['popup'],
  locked: true,
  db: ['getAccountGroup'],
}

export const main = ({db: {getAccountGroup}}) => !getAccountGroup()?.length
