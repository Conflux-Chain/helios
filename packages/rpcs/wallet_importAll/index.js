import {map, password, stringp} from '@cfxjs/spec'
import {decrypt} from 'browser-passworder'
import browser from 'webextension-polyfill'

export const NAME = 'wallet_importAll'

export const schemas = {
  inputs: [
    map,
    {closed: true},
    ['decryptPassword', password],
    ['vaults', stringp],
  ],
}

export const permissions = {
  external: ['popup'],
  locked: true,
  methods: ['wallet_validatePassword'],
  db: ['t'],
}

export const main = async ({
  Err: {InvalidParams},
  params: {decryptPassword, vaults},
}) => {
  let data, decrypted

  try {
    data = JSON.parse(vaults)
  } catch (err) {
    throw InvalidParams('Invalid vaults data, must be a valid json string')
  }

  try {
    decrypted = await decrypt(decryptPassword, data.encrypted)
  } catch (err) {
    throw InvalidParams('Invalid vaults data')
  }

  await browser.storage.local.set({wallet_importAll: decrypted})
  browser.runtime.reload()
}
