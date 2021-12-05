import {map, dbid, password} from '@fluent-wallet/spec'
import {getNthAccountOfHDKey} from '@fluent-wallet/hdkey'
import {decrypt} from 'browser-passworder'

export const NAME = 'wallet_exportAccount'

export const schemas = {
  input: [map, {closed: true}, ['accountId', dbid], ['password', password]],
}

export const permissions = {
  db: ['findAccount'],
  methods: ['wallet_validatePassword', 'wallet_exportAccountGroup'],
  external: ['popup'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {findAccount},
  rpcs: {wallet_validatePassword, wallet_exportAccountGroup},
  params: {password, accountId},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw InvalidParams('Invalid password')

  const account = findAccount({
    accountId,
    g: {
      account: {
        index: 1,
        address: {
          hex: 1,
          value: 1,
          pk: 1,
          id: 1,
          network: {hdPath: {value: 1}, name: 1},
        },
        accountGroup: {vault: {type: 1, cfxOnly: 1, data: 1, ddata: 1}, eid: 1},
      },
    },
  })
  if (!account.accountGroup.vault.type)
    throw InvalidParams(`Invalid account id ${accountId}`)

  const {vault} = account.accountGroup
  if (vault.type !== 'hd')
    return await wallet_exportAccountGroup({
      password,
      accountGroupId: account.accountGroup.id,
    })

  const decrypted = vault.ddata || (await decrypt(password, vault.data))

  const rst = account.address.map(async ({hex, value, pk, network}) => {
    const hdPath = network.hdPath.value // account.accountGroup.customHdPath?.value ||
    const privateKey =
      pk ||
      (
        await getNthAccountOfHDKey({
          mnemonic: decrypted,
          hdPath,
          nth: account.index,
          only0x1Prefixed: Boolean(vault.cfxOnly),
        })
      ).privateKey

    return {
      hex,
      value,
      privateKey,
      network,
    }
  })

  return await Promise.all(rst)
}
