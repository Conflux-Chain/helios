import {optParam} from '@fluent-wallet/spec'
import {decrypt} from 'browser-passworder'

export const NAME = 'wallet_getImportHardwareWalletInfo'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup'],
  db: ['findGroup', 'getPassword'],
}

export const main = async ({db: {findGroup, getPassword}}) => {
  const pwd = getPassword()
  const groups = findGroup({
    types: ['hw'],
    g: {
      eid: 1,
      nickname: 1,
      account: {
        index: 1,
        hidden: 1,
        nickname: 1,
        address: {
          value: 1,
          hex: 1,
          network: {name: 1, type: 1, hdPath: {name: 1, value: 1}},
        },
      },
      vault: {data: 1, cfxOnly: 1},
    },
  })

  const promises = groups.map(async g => {
    const ddata = JSON.parse(await decrypt(pwd, g.vault.data))
    g.vault.ddata = ddata
    return g
  })

  return await Promise.all(promises)
}
