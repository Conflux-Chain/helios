import {map, password, stringp} from '@fluent-wallet/spec'
import {decrypt} from 'browser-passworder'

export const NAME = 'wallet_importAll'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['password', password],
    ['decryptPassword', password],
    ['vaults', stringp],
  ],
}

export const permissions = {
  external: ['popup'],
  locked: true,
  methods: ['wallet_validatePassword', 'wallet_addVault'],
  db: ['t'],
}

export const main = async ({
  Err: {InvalidParams},
  rpcs: {wallet_addVault, wallet_validatePassword},
  params: {password, decryptPassword, vaults},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw InvalidParams('Invalid password')
  let data, decrypted

  try {
    data = JSON.parse(vaults)
  } catch (err) {
    throw InvalidParams('Invalid vaults data, must be a valid json string')
  }

  if (!data.wallet || !data.encrypted)
    throw InvalidParams('Invalid vaults data')

  try {
    decrypted = await decrypt(decryptPassword, data.encrypted)
    JSON.parse(decrypted)
  } catch (err) {
    throw InvalidParams('Invalid vaults data')
  }

  if (data.wallet === 'fluent') {
    const browser = (await import('webextension-polyfill')).default
    await browser.storage.local.set({wallet_importAll: decrypted})
    browser?.runtime?.reload?.()

    return
  }

  if (data.wallet === 'portal') {
    decrypted = JSON.parse(decrypted)
    if (!Array.isArray(decrypted)) throw InvalidParams('Invalid vaults data')

    const rst = []

    for (const [type, cred] of decrypted) {
      if (type !== 'hd' && type !== 'pk')
        throw InvalidParams(`Invalid type ${type} of credentials`)
      rst.push(
        await wallet_addVault({
          password,
          [type === 'hd' ? 'mnemonic' : 'privateKey']: cred,
        }),
      )
    }

    return rst
  }
}
