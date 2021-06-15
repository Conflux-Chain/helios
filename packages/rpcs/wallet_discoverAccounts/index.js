import {dbid, int, map, truep} from '@cfxjs/spec'
import {discoverAccounts} from '@cfxjs/discover-accounts'
import {partial} from '@cfxjs/compose'
import {decrypt} from 'browser-passworder'

export const NAME = 'wallet_discoverAccounts'

const limitSchema = [
  'limit',
  {optional: true},
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
  methods: ['wallet_getBalance', 'wallet_getNextNonce', 'wallet_createAccount'],
  db: [
    't',
    'getById',
    'getNetwork',
    'getPassword',
    'getOneAccount',
    'getAccount',
  ],
}

export const main = async ({
  rpcs: {wallet_getBalance, wallet_getNextNonce, wallet_createAccount},
  db: {getById, getNetwork, getPassword, getAccount},
  params: {accountGroupId, limit = 10, waitTillFinish},
  Err: {InvalidParams},
}) => {
  const accountGroup = getById(accountGroupId)
  if (!accountGroup)
    throw InvalidParams('Invalid accountGroupId, account group not found')
  const oldAccountsCount =
    getAccount({accountGroup: accountGroupId})?.length ?? 0

  const vault = getById(accountGroup.vault.eid)
  if (vault.type !== 'hd') return // no need to discover accounts for none hd vault

  const mnemonic = await decrypt(getPassword(), vault.data)

  const networks = getNetwork()

  const promises = Promise.all(
    networks.map(
      async ({name, hdPath}) =>
        await discoverAccounts({
          getBalance: partial(wallet_getBalance, {networkName: name}),
          getTxCount: partial(wallet_getNextNonce, {networkName: name}),
          mnemonic,
          hdPath: hdPath.value,
          return0: oldAccountsCount === 0,
          startFrom: oldAccountsCount,
          max: limit,
        }),
    ),
  ).then(async found => {
    // find the one that discovered most accounts
    const accountNumToCreate = found.reduce(
      (acc, net) => Math.max(acc, net.length),
      0,
    )

    const accountIds = []
    for (let i = 0; i < accountNumToCreate; i++) {
      accountIds.push(await wallet_createAccount({accountGroupId}))
    }
    return accountIds
  })

  if (waitTillFinish) {
    return await promises
  }
}
