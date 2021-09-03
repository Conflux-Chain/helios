import {map, dbid, password} from '@cfxjs/spec'
import {getNthAccountOfHDKey} from '@cfxjs/hdkey'
import {decrypt} from 'browser-passworder'

export const NAME = 'wallet_exportAccount'

export const schemas = {
  input: [map, {closed: true}, ['accountId', dbid], ['password', password]],
}

export const permissions = {
  db: ['getAccountById', 'getAddressNetwork', 'getAccountAccountGroup'],
  methods: ['wallet_validatePassword', 'wallet_exportAccountGroup'],
  external: ['popup'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getAccountById, getAddressNetwork, getAccountAccountGroup},
  rpcs: {wallet_validatePassword, wallet_exportAccountGroup},
  params: {password, accountId},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw InvalidParams('Invalid password')

  const account = getAccountById(accountId)
  const accountGroup = getAccountAccountGroup(accountId)
  if (!accountGroup?.vault?.type)
    throw InvalidParams(`Invalid account id ${accountId}`)

  const {vault} = accountGroup
  if (vault.type !== 'hd')
    return await wallet_exportAccountGroup({
      password,
      accountGroupId: accountGroup.eid,
    })

  const decrypted = vault.ddata || decrypt(password, vault.data)

  const rst = account.address.map(
    async ({index, hex, cfxHex, base32, pk, eid}) => {
      const network = getAddressNetwork(eid)
      const hdPath = network.hdPath.value // accountGroup.customHdPath?.value ||
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
