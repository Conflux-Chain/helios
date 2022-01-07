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
  db: ['getPassword', 'findGroup', 'getNetworkById', 't', 'newAddressTx'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getNetworkById, findGroup, getPassword, t, newAddressTx},
  params: {networkId, accountGroupId},
}) => {
  const network = getNetworkById(networkId)
  if (!network) throw InvalidParams(`Invalid network id ${networkId}`)
  const group = findGroup({
    groupId: accountGroupId,
    g: {
      account: {eid: 1, index: 1},
      vault: {type: 1, cfxOnly: 1, ddata: 1, data: 1},
    },
  })
  if (!group) throw InvalidParams(`Invalid account group id ${accountGroupId}`)
  const {vault} = group
  if (vault.type === 'pub' && vault.cfxOnly && network.type !== 'cfx')
    throw InvalidParams(
      "Can't create address for cfx only vault in eth network",
    )

  const pwd = getPassword()

  const decrypted = vault.ddata || (await decrypt(pwd, vault.data))
  if (vault.type === 'pub') {
    const addrTx = newAddressTx({
      eid: 'newAddr',
      hex: decrypted,
      network: networkId,
      value:
        network.type === 'cfx'
          ? encode(toAccountAddress(decrypted), network.netId)
          : decrypted,
    })
    return [
      t([addrTx, {eid: group.account[0].eid, account: {address: addrTx.eid}}])
        .tempids.newAddr || addrTx.eid,
    ]
  } else if (vault.type === 'pk') {
    const hex = fromPrivate(decrypted).address
    const addrTx = newAddressTx({
      eid: 'newAddr',
      hex: hex.toLowerCase(),
      network: networkId,
      value:
        network.type === 'cfx'
          ? encode(toAccountAddress(hex), network.netId)
          : hex.toLowerCase(),
    })
    return [
      t([addrTx, {eid: group.account[0].eid, account: {address: addrTx.eid}}])
        .tempids.newAddr || addrTx.eid,
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
      toCreates.map(({account, addr: {privateKey, address}}) => {
        const addrTx = newAddressTx({
          eid: 'newAddr',
          hex: address.toLowerCase(),
          pk: privateKey,
          network: networkId,
          value:
            network.type === 'cfx'
              ? encode(toAccountAddress(address), network.netId)
              : address.toLowerCase(),
        })
        return (
          t([addrTx, {eid: account.eid, account: {address: addrTx.eid}}])
            .tempids.newAddr || addrTx.eid
        )
      }),
    )
  }
}
