export const NAME = 'wallet_isLocked'

export const permissions = {
  db: ['getLocked'],
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({db: {getLocked}}) => getLocked()
