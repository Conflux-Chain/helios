import {map, password, boolean} from '@fluent-wallet/spec'
import {decrypt} from 'browser-passworder'

export const NAME = 'wallet_validatePassword'

export const schemas = {
  input: [map, {closed: true}, ['password', password]],
  output: boolean,
}

export const permissions = {
  locked: true,
  db: ['getVault', 'getPassword', 'getLocked'],
}

export async function main({
  db: {getVault, getLocked, getPassword},
  params: {password},
}) {
  // validate with in-mem password if not locked
  if (!getLocked()) return password === getPassword()

  // validate with vault if locked
  const vaults = getVault()

  // return true if zero vault
  if (!vaults.length) return true

  // validate
  let valid = false
  try {
    await decrypt(password, vaults[0].data)
    valid = true
  } catch (err) {
    valid = false
  }

  return valid
}
