import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_zeroAccountGroup'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup'],
  locked: true,
  db: ['findAddress'],
}

export const main = ({db: {findAddress}}) => {
  const selectedAddr = findAddress({selected: true})
  if (Number.isInteger(selectedAddr)) return false
  else return true
}
