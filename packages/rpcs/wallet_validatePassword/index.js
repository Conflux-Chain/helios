import {map, password, boolean} from '@cfxjs/spec'
import {decrypt} from 'browser-passworder'

export const NAME = 'wallet_validatePassword'

export const schema = {
  input: [map, ['password', password]],
  output: boolean,
}

export const permissions = {
  methods: ['wallet_getVaults'],
}

export async function main({rpcs, params: {password}} = {params: {}}) {
  const vaults = (await rpcs.wallet_getVaults()) || []
  if (!vaults.length) return true
  let valid = false
  try {
    await decrypt(password, vaults[0])
    valid = true
  } catch (err) {
    valid = false
  }

  return valid
}
