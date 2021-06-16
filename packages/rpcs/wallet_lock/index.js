export const NAME = 'wallet_lock'

export const permissions = {
  db: ['setLocked'],
  external: ['popup'],
}

export const main = async ({db: {setLocked}}) => {
  setLocked(true)
}
