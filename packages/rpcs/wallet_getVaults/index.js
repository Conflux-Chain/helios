import {arr, string, map} from '@cfxjs/spec'

export const NAME = 'wallet_getVaults'

export const schema = {
  output: [map, ['Vaults', [arr, string]]],
  getWalletState: [map, ['Vaults', [arr, string]]],
}

export const permissions = {
  store: {read: true},
}

export async function main({getWalletState}) {
  return getWalletState().Vaults
}
