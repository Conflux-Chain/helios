import {
  map,
  password,
  base32UserAddress,
  ethHexAddress,
  or,
} from '@fluent-wallet/spec'
import {decrypt} from 'browser-passworder'
import {getNthAccountOfHDKey} from '@fluent-wallet/hdkey'
import {addHexPrefix} from '@fluent-wallet/utils'

export const NAME = 'wallet_getAddressPrivateKey'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['address', [or, base32UserAddress, ethHexAddress]],
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
  db: ['findAddress', 'getPassword'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getPassword, findAddress},
  params: {password, address},
  _popup,
  network,
}) => {
  if (_popup && password !== getPassword())
    throw InvalidParams('Invalid password')
  const addr = findAddress({
    value: address,
    networkId: network.eid,
    g: {
      _account: {
        _accountGroup: {vault: {type: 1, ddata: 1, data: 1}},
        index: 1,
      },
      pk: 1,
      network: {hdPath: {value: 1}},
    },
  })
  if (!addr) throw InvalidParams(`Invalid address ${address}`)

  if (addr.pk) return addHexPrefix(addr.pk)

  const {vault} = addr.account.accountGroup

  if (vault.type === 'pub')
    throw InvalidParams(
      `Invalid address ${address}, the address vault is pub only`,
    )

  password = getPassword()

  if (vault.type === 'pk')
    return addHexPrefix(vault.ddata || (await decrypt(password, vault.data)))

  if (vault.type === 'hd') {
    const mnemonic = vault.ddata || (await decrypt(password, vault.data))
    const {privateKey} = await getNthAccountOfHDKey({
      mnemonic,
      hdPath: addr.network.hdPath.value,
      nth: addr.account.index,
      only0x1Prefixed: vault.cfxOnly,
    })

    return addHexPrefix(privateKey)
  }
}
