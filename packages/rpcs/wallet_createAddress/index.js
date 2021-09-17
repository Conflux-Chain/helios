import {map, dbid} from '@fluent-wallet/spec'
import {getNthAccountOfHDKey} from '@fluent-wallet/hdkey'
import {encode} from '@fluent-wallet/base32-address'
import {fromPrivate, toAccountAddress} from '@fluent-wallet/account'
import {decrypt} from 'browser-passworder'

export const NAME = 'wallet_createAddress'

export const schemas = {
  input: [map, {closed: true}, ['accountGroupId', dbid], ['networkId', dbid]],
}

export const permissions = {
  methods: [],
  db: ['getPassword', 'getAccountGroupById', 'getNetworkById', 't'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getNetworkById, getAccountGroupById, getPassword, t},
  params: {networkId, accountGroupId},
}) => {
  const network = getNetworkById(networkId)
  if (!network) throw InvalidParams(`Invalid network id ${networkId}`)
  const group = getAccountGroupById(accountGroupId)
  if (!group) throw InvalidParams(`Invalid account group id ${accountGroupId}`)
  const {vault} = group
  if (vault.type === 'pub' && vault.cfxOnly && network.type !== 'cfx')
    throw InvalidParams(
      "Can't create address for cfx only vault in eth network",
    )

  const pwd = getPassword()

  const decrypted = vault.ddata || (await decrypt(pwd, vault.data))
  if (vault.type === 'pub') {
    return [
      t([
        {eid: 'newAddr', address: {vault: vault.eid, index: 0, hex: decrypted}},
        network.type === 'cfx' && {
          eid: 'newAddr',
          address: {
            cfxHex: toAccountAddress(decrypted),
            base32: encode(toAccountAddress(decrypted), network.netId),
          },
        },
        {eid: group.account[0].eid, account: {address: 'newAddr'}},
        {eid: network.eid, network: {address: 'newAddr'}},
      ]).tempids.newAddr,
    ]
  } else if (vault.type === 'pk') {
    const hex = fromPrivate(decrypted)
    return [
      t([
        {eid: 'newAddr', address: {vault: vault.eid, index: 0, hex}},
        network.type === 'cfx' && {
          eid: 'newAddr',
          address: {
            cfxHex: toAccountAddress(hex),
            base32: encode(toAccountAddress(hex), network.netId),
          },
        },
        {eid: group.account[0].eid, account: {address: 'newAddr'}},
        {eid: network.eid, network: {address: 'newAddr'}},
      ]).tempids.newAddr,
    ]
  } else {
    return await Promise.all(
      group.account.map(async account => ({
        account,
        addr: await getNthAccountOfHDKey({
          mnemonic: decrypted,
          hdPath: network.hdPath.value,
          nth: account.index,
          only0x1Prefixed: vault.cfxOnly,
        }),
      })),
    ).then(toCreates =>
      toCreates.map(
        ({account, addr: {privateKey, address, index}}) =>
          t([
            {
              eid: 'newAddr',
              address: {vault: vault.eid, index, hex: address, pk: privateKey},
            },
            network.type === 'cfx' && {
              eid: 'newAddr',
              address: {
                cfxHex: toAccountAddress(address),
                base32: encode(toAccountAddress(address), network.netId),
              },
            },
            {eid: account.eid, account: {address: 'newAddr'}},
            {eid: network.eid, network: {address: 'newAddr'}},
          ]).tempids.newAddr,
      ),
    )
  }
}
