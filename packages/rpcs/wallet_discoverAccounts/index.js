import {dbid, int, map, truep} from '@cfxjs/spec'
import {discoverAccounts} from '@cfxjs/discover-accounts'
import {partial} from '@cfxjs/compose'
import {decrypt} from 'browser-passworder'
import {encode} from '@cfxjs/base32-address'

export const NAME = 'wallet_discoverAccounts'

const limitSchema = [
  'limit',
  {optiona: true},
  [int, {min: 1, max: 100, doc: 'how many derivation we try, default to 10'}],
]

const authedSchema = [
  map,
  {closed: true},
  ['accountGroupId', dbid],
  ['waitTillFinish', {optional: true}, truep],
  limitSchema,
]

export const schemas = {
  input: authedSchema,
}

export const permissions = {
  internal: true,
  unlocked: true,
  methods: ['wallet_getBalance', 'wallet_getNextNonce'],
  db: ['t', 'getById', 'getNetwork', 'getPassword', 'getOneAccount'],
}

export const main = async ({
  rpcs: {wallet_getBalance, wallet_getNextNonce},
  db: {t, getById, getNetwork, getPassword, getOneAccount},
  params: {accountGroupId, limit = 10, waitTillFinish},
  Err: {InvalidParams},
}) => {
  const accountGroup = getById(accountGroupId)
  if (!accountGroup)
    throw InvalidParams('Invalid accountGroupId, account group not found')
  if (accountGroup.accounts?.length >= limit) return

  const vault = getById(accountGroup.vault.eid)
  if (vault.type !== 'hd') return // no need to discover accounts for none hd vault

  const mnemonic = await decrypt(getPassword(), vault.data)

  const networks = getNetwork()

  const promises = networks.map(({name, hdPath, eid, netId, type}) =>
    discoverAccounts({
      getBalance: partial(wallet_getBalance, {networkName: name}),
      getTxCount: partial(wallet_getNextNonce, {networkName: name}),
      mnemonic,
      hdPath: hdPath.value,
      max: limit,
      onFindOne: ({address, privateKey, index, nth}) => {
        const account = getOneAccount({
          index: nth,
          accountGroup: accountGroup.eid,
        })
        const tmpAccountId = account?.eid ?? -2

        t([
          {
            eid: -1,
            address: {
              vault: vault.eid,
              network: eid,
              index,
              hex: address,
              cfxHex: address.replace(/^0x./, '0x1'),
              pk: privateKey,
            },
          },
          type === 'cfx' && {
            eid: -1,
            address: {
              base32Mainnet: encode(
                address.replace(/^0x./, '0x1'),
                netId,
                true,
              ),
            },
          },
          {
            eid: tmpAccountId,
            account: {
              index: nth,
              nickname: `Account ${nth + 1}`,
              address: -1,
              accountGroup: accountGroup.eid,
            },
          },
        ])
      },
    }),
  )

  if (waitTillFinish) return await Promise.all(promises)
}
