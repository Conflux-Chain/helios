import {arr, string} from '@cfxjs/spec'

export const NAME = 'wallet_getVaults'

export const schema = {
  output: [arr, string],
  getWalletState: [arr, string],
}

export const permissions = {
  store: {read: true},
}

export async function main({getWalletState}) {
  return getWalletState().Vaults
}
