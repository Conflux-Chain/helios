import {map, booleanp} from '@fluent-wallet/spec'
import {any} from 'ramda'

export const NAME = 'wallet_afterUnlock'

export const schemas = {
  input: [map, {closed: true}, ['waitSideEffects', {optional: true}, booleanp]],
}

export const permissions = {
  external: [],
  methods: [
    'wallet_refetchTokenList',
    'wallet_refetchBalance',
    'wallet_discoverAccounts',
    'wallet_createAddress',
  ],
  db: ['getAccountGroup', 'getNetwork'],
}

async function updateBalanceInfo({
  params: {waitSideEffects},
  db: {getAccountGroup},
  rpcs: {
    wallet_discoverAccounts,
    wallet_refetchTokenList,
    wallet_refetchBalance,
  },
}) {
  let promise = wallet_refetchTokenList()
    .then(() =>
      Promise.all(
        getAccountGroup().map(({eid}) =>
          wallet_discoverAccounts({accountGroupId: eid, waitTillFinish: true}),
        ),
      ),
    )
    .then(() => wallet_refetchBalance({type: 'all', allNetwork: true}))
  if (waitSideEffects) await promise
}

// when there're new networks added while wallet is locked (through migration)
// we need to add misiing addrs to account
async function fillMissingAccountAddress({
  rpcs: {wallet_createAddress},
  db: {getNetwork, getAccountGroup},
}) {
  const networks = getNetwork()
  const cfxNetworks = getNetwork({type: 'cfx'})
  const ethNetworks = getNetwork({type: 'eth'})
  const lackCfxAddr = any(
    account => account.address.length < cfxNetworks.length,
  )
  const lackEthAddr = any(
    account => account.address.length < ethNetworks.length,
  )
  const lackAddr = any(account => account.address.length < networks.length)
  const promises = getAccountGroup().reduce((acc, {vault, account, eid}) => {
    // cfx only account group
    if (vault.cfxOnly && (vault.type === 'pub' || vault.type === 'hw')) {
      //  lack cfx network addrs
      if (lackCfxAddr(account)) {
        return acc.concat(
          cfxNetworks.map(network =>
            wallet_createAddress({
              accountGroupId: eid,
              networkId: network.eid,
            }),
          ),
        )
      } else {
        return acc
      }
    } else if (!vault.cfxOnly && vault.type === 'hw') {
      //  lack eth network addrs
      if (lackEthAddr(account)) {
        return acc.concat(
          ethNetworks.map(network =>
            wallet_createAddress({
              accountGroupId: eid,
              networkId: network.eid,
            }),
          ),
        )
      } else {
        return acc
      }
    } else if (lackAddr(account)) {
      const _networks = networks.filter(n =>
        account.some(({address}) =>
          address.every(({network: _n}) => _n.chainId !== n.chainId),
        ),
      )
      // rest account group, lack addrs
      return acc.concat(
        _networks.map(network => {
          return wallet_createAddress({
            accountGroupId: eid,
            networkId: network.eid,
          })
        }),
      )
    } else {
      return acc
    }
  }, [])
  return Promise.all(promises)
}

export const main = async args => {
  await fillMissingAccountAddress(args)
  try {
    await updateBalanceInfo(args)
    // eslint-disable-next-line no-empty
  } catch (err) {}
}
