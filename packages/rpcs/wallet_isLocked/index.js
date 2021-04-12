export const NAME = 'wallet_isLocked'

export const permissions = {
  db: ['getLocked'],
}

export const main = ({db: {getLocked}}) => {
  return getLocked()
}
