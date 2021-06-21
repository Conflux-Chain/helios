import {map, dbid, password} from '@cfxjs/spec'
import {getNthAccountOfHDKey} from '@cfxjs/hdkey'
import {decrypt} from 'browser-passworder'

export const NAME = 'wallet_exportAccount'

export const schemas = {
  input: [map, {closed: true}, ['accountId', dbid], ['password', password]],
}

export const permissions = {
  db: ['getById'],
  methods: ['wallet_validatePassword', 'wallet_exportAccountGroup'],
  external: ['popup'],
}

export const main = async ({
  Err,
  db: {getById},
  rpcs: {wallet_validatePassword, wallet_exportAccountGroup},
  params: {password, accountId},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw Err.InvalidParams('Invalid password')

  const account = getById(accountId)
  if (!account?.accountGroup?.vault?.type)
    throw Err.InvalidParams(`Invalid account id ${accountId}`)

  const {vault} = account.accountGroup
  if (vault.type !== 'hd')
    return await wallet_exportAccountGroup({
      password,
      accountGroupId: account.accountGroup.eid,
    })

  const decrypted = vault.ddata || decrypt(password, vault.data)

  const rst = account.address.map(
    async ({network, index, hex, cfxHex, base32, pk}) => {
      const hdPath =
        account.accountGroup.customHdPath?.value || network.hdPath.value
      const privateKey =
        pk ||
        (
          await getNthAccountOfHDKey({
            mnemonic: decrypted,
            hdPath,
            nth: index,
            only0x1Prefixed: Boolean(vault.cfxOnly),
          })
        ).privateKey

      return {
        hex,
        cfxHex,
        base32,
        privateKey,
        network,
      }
    },
  )

  return await Promise.all(rst)
}
