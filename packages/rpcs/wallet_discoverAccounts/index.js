import {dbid, int, map, truep, maybe} from '@fluent-wallet/spec'
import addrByNet from '@fluent-wallet/addr-by-network'
import {discoverAccounts} from '@fluent-wallet/discover-accounts'
import {partial} from '@fluent-wallet/compose'
import {decrypt} from 'browser-passworder'
import {chan} from '@fluent-wallet/csp'

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
  ['waitTillFinish', {optional: true}, [maybe, truep]],
  limitSchema,
]

export const schemas = {
  input: authedSchema,
}

export const permissions = {
  external: ['popup'],
  methods: ['wallet_getBalance', 'wallet_getNextNonce', 'wallet_createAccount'],
  db: ['findGroup', 'getNetwork', 'getPassword'],
}

export const main = async ({
  rpcs: {wallet_getBalance, wallet_getNextNonce, wallet_createAccount},
  db: {findGroup, getNetwork, getPassword},
  params: {accountGroupId, limit = 1000, waitTillFinish},
  Err: {InvalidParams},
}) => {
  const accountGroup = findGroup({
    groupId: accountGroupId,
    g: {vault: {type: 1, data: 1, ddata: 1}, account: {eid: 1}},
  })
  if (!accountGroup)
    throw InvalidParams('Invalid accountGroupId, account group not found')
  const oldAccountsCount = accountGroup.account?.length ?? 0

  const {vault} = accountGroup
  if (vault.type !== 'hd') return // no need to discover accounts for none hd vault

  const mnemonic = vault.ddata || (await decrypt(getPassword(), vault.data))

  const networks = getNetwork()
  // rpc engine packages/rpc-engine/middlewares/inject-rpc-store.js 里对所有rpc 方法封装了
  // 如果参数的length 为2 那么第一项就为一些配置，第二项才是main 的参数
  // 下面这个wallet_getBalance就是这么调用的
  // 用来找到所有网络下有余额的地址或者有发生过交易的地址。返回的是个chanel
  // 注意这个 oldAccountsCount 这里是判断 除了钱包现在的地址还有没有其他地址
  const channels = networks.map(({name, hdPath, token, type, netId}) =>
    discoverAccounts({
      getBalance: addr =>
        wallet_getBalance(
          {networkName: name, errorFallThrough: true},
          {
            users: [
              addrByNet({
                address: addr,
                networkType: type,
                networkId: netId,
                addressType: 'user',
              }),
            ],
            tokens: ['0x0'].concat((token || []).map(t => t.address)),
          },
        ),
      getTxCount: partial(wallet_getNextNonce, {networkName: name}),
      mnemonic,
      hdPath: hdPath.value,
      return0: oldAccountsCount === 0,
      startFrom: oldAccountsCount,
      max: limit,
    }),
  )

  const discoveredNewAddressOnEachNet = networks.map(() => 0)

  const accountIds = []
  const firstAccountCreatedChan = chan(1)
  const promises = channels.map(async (c, idx) => {
    // read 是一个一个拿。write 一次 read 一次 挨着个拿。
    while (!c.isClosed()) {
      const found = await c.read()
      if (!found) {
        !firstAccountCreatedChan.isClosed() &&
          firstAccountCreatedChan.write(true)
        return
      }
      discoveredNewAddressOnEachNet[idx] += 1
      // 如果有新的有余额/未完成交易的地址那么就会 创建一下新地址
      if (greatThanOthers(idx, discoveredNewAddressOnEachNet)) {
        accountIds.push(await wallet_createAccount({accountGroupId}))
        !firstAccountCreatedChan.isClosed() &&
          firstAccountCreatedChan.write(true)
      }
    }
  })

  if (waitTillFinish) {
    return await Promise.all(promises)
  }

  return await firstAccountCreatedChan.read()
}

function greatThanOthers(idx, arr) {
  const base = arr[idx]
  return arr.reduce(
    (acc, item, innerIdx) => acc && (innerIdx === idx || base > item),
    true,
  )
}
