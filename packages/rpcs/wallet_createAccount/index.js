/* eslint-disable */
import {map, dbid, truep, string} from '@cfxjs/spec'
import {decrypt} from 'browser-passworder'
import {getNthAccountOfHDKey} from '@cfxjs/hdkey'
import {fromPrivate, toAccountAddress} from '@cfxjs/account'

export const NAME = 'wallet_createAccount'

export const schemas = {
  input: [
    map,
    {closed: true},
    [
      map,
      {closed: true},
      ['vaultId', dbid],
      ['only0x1Prefixed', {optional: true}, truep],
      ['hdPath', {optional: true}, string],
    ],
  ],
}

export const permissions = {
  db: ['createAccount', 'getPassword', 'getVaultById'],
}

export const main = async ({
  db: {createAccount, getPassword, getVaultById},
  params: {vaultId, only0x1Prefixed, hdPath},
  Err,
}) => {
  const password = getPassword()
  if (!password) throw Err.InvalidRequest('Wallet is locked')

  const vault = getVaultById(vaultId)
  if (!vault) throw Err.InvalidParams(`Invalid vault id ${vaultId}`)

  const decrypted = await decrypt(password, vault.data)

  if (vault.type === 'hd') {
    const accounts = vault.accounts
    let nth = accounts.length
    if (only0x1Prefixed) {
      nth = accounts.filter(
        account =>
          Number.isInteger(account.hdIndex) &&
          account.ethHexAddress &&
          account.ethHexAddress.startsWith('0x1'),
      ).length
    }

    try {
      let {address, index} = await getNthAccountOfHDKey({
        mnemonic: decrypted,
        only0x1Prefixed,
        nth,
        hdPath: hdPath || undefined,
      })
      address = address.toLowerCase()

      return createAccount({
        ethHexAddress: address,
        cfxHexAddress: toAccountAddress(address),
        hdIndex: index,
        vault: vaultId,
      })
    } catch (err) {
      throw Err.InvalidParams(`Invalid hdPath ${hdPath}`)
    }
  }

  if (only0x1Prefixed)
    throw Err.InvalidParams(
      "Don't support only0x1Prefixed account on none hd wallet",
    )
  if (hdPath) throw Err.InvalidParams("Don't support hdPath on none hd wallet")

  if (vault.type === 'pk') {
    let {address} = fromPrivate(decrypted)
    address = address.toLowerCase()
    return createAccount({
      ethHexAddress: address,
      cfxHexAddress: toAccountAddress(address),
      vault: vaultId,
    })
  }

  if (vault.type === 'pub') {
    const account = {
      vault: vaultId,
      cfxHexAddress: toAccountAddress(decrypted.toLowerCase()),
    }
    if (vault.cfxOnly) return createAccount(account)
    account.ethHexAddress = decrypted.toLowerCase()
    return createAccount(account)
  }

  throw Err.InvalidParams(`Invalid vault id ${vaultId}`)
}
