export const NAME = 'wallet_isLocked'

export const permissions = {
  db: ['getLocked'],
  external: ['popup'],
  locked: true,
}

export const main = ({db: {getLocked}}) => {
  return getLocked()
}
