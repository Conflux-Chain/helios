import {arr, string} from '@cfxjs/spec'

export const NAME = 'wallet_getVaults'

export const schema = {
  output: [arr, string],
}

export const permissions = {
  db: ['getVault'],
}

export async function main({db: {getVault}}) {
  return getVault()
}
