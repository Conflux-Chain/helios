export const NAME = 'wallet_lock'

export const permissions = {
  store: {write: true},
}

export const main = async ({setWalletState}) => {
  setWalletState({MemStore: {password: null, locked: true}})
}
