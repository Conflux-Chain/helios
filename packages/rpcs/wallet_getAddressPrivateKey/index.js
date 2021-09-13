import {dbid, map, password} from '@fluent-wallet/spec'
import {decrypt} from 'browser-passworder'
import {getNthAccountOfHDKey} from '@fluent-wallet/hdkey'
import {addHexPrefix} from '@fluent-wallet/utils'

export const NAME = 'wallet_getAddressPrivateKey'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['addressId', dbid],
    [
      'password',
      {optional: true, doc: 'required when calling from popup'},
      password,
    ],
  ],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['getAddressById', 'getPassword', 'getAddressNetwork'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getPassword, getAddressById, getAddressNetwork},
  params: {password, addressId},
  _popup,
}) => {
  if (_popup && password !== getPassword())
    throw InvalidParams('Invalid password')
  const addr = getAddressById(addressId)
  if (!addr) throw InvalidParams(`Invalid address id ${addressId}`)

  if (addr.pk) return addHexPrefix(addr.pk)

  const {vault} = addr

  if (vault.type === 'pub')
    throw InvalidParams(
      `Invalid address id ${addressId}, the address vault is pub only`,
    )

  password = getPassword()

  if (vault.type === 'pk')
    return addHexPrefix(vault.ddata || (await decrypt(password, vault.data)))

  if (vault.type === 'hd') {
    const mnemonic = vault.ddata || (await decrypt(password, vault.data))
    const network = getAddressNetwork(addressId)
    const {privateKey} = await getNthAccountOfHDKey({
      mnemonic,
      hdPath: network.hdPath.value,
      nth: addr.index,
      only0x1Prefixed: vault.cfxOnly,
    })

    return addHexPrefix(privateKey)
  }
}
