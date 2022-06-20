import {optParam} from '@fluent-wallet/spec'
import {
  CFX_MAINNET_NETID,
  CFX_TESTNET_NETID,
  CFX_ESPACE_MAINNET_NETID,
  CFX_ESPACE_TESTNET_NETID,
} from '@fluent-wallet/consts'
import {transaction} from '@fluent-wallet/confluxscan-api/account'
import {memoize1} from '@thi.ng/memoize'
import {TLRUCache} from '@thi.ng/cache'

const tlruCache = new TLRUCache(null, {ttl: 300000}) // 5 min

export const NAME = 'wallet_refetchTxList'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup'],
  locked: true,
  methods: [
    'wallet_getNextNonce',
    'wallet_getBlockOrEpochNumber',
    'wallet_enrichConfluxTx',
    'wallet_enrichEthereumTx',
  ],
  db: ['queryNonceGapTxs', 'getOneNetwork', 'getAddress', 'insertExternalTx'],
}

async function eachTx(
  addr,
  tx,
  {
    db: {insertExternalTx},
    rpcs: {wallet_enrichEthereumTx, wallet_enrichConfluxTx},
  },
) {
  const {payload, receipt, extra, ...restTx} = tx

  insertExternalTx({tx: restTx, receipt, payload, extra, addressId: addr.eid})
  if (addr.network.type === 'cfx')
    await wallet_enrichConfluxTx({txhash: restTx.hash})
  else await wallet_enrichEthereumTx({txhash: restTx.hash})
}

async function eachGap([[, block1], [, block2]], addr, args) {
  const {
    rpcs: {wallet_getBlockOrEpochNumber},
  } = args
  if (block2 === 'latest')
    block2 = await wallet_getBlockOrEpochNumber(
      {errorFallThrough: true, networkName: addr.network.name},
      [],
    )
  if (!block2) return
  const txs = await transaction({
    chainId: addr.network.chainId,
    networkId: addr.network.netId,
    address: addr.value,
    startblock: parseInt(block1, 16),
    endblock: parseInt(block2, 16),
  })
  txs?.list.forEach(tx => eachTx(addr, tx, args))
}

function eachAddress(addr, args) {
  // cache for 5 minutes for each addressId
  const eachAddress1 = memoize1(async addressId => {
    if (!addr.tx?.length) return
    const {
      rpcs: {wallet_getNextNonce},
      db: {queryNonceGapTxs},
    } = args

    try {
      const nonce = await wallet_getNextNonce(
        {
          network: addr.network,
          networkName: addr.network.name,
          errorFallThrough: true,
        },
        [addr.value],
      )
      const gaps = queryNonceGapTxs({addressId, nextNonce: nonce})
      if (gaps) {
        for (const gap of gaps) {
          await eachGap(gap, addr, args)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }, tlruCache)
  return eachAddress1(addr.eid)
}

async function eachNetwork(network, args) {
  const {
    db: {getAddress},
  } = args
  const addrs = getAddress({network: network.eid})
  for (const addr of addrs) {
    await eachAddress(addr, args)
  }
}

async function main1(args) {
  const {
    db: {getOneNetwork},
  } = args
  const networks = [
    getOneNetwork({type: 'eth', netId: CFX_ESPACE_MAINNET_NETID}),
    getOneNetwork({type: 'cfx', netId: CFX_MAINNET_NETID}),
    getOneNetwork({type: 'eth', netId: CFX_ESPACE_TESTNET_NETID}),
    getOneNetwork({type: 'cfx', netId: CFX_TESTNET_NETID}),
  ]
  for (const network of networks) {
    await eachNetwork(network, args)
  }
}

export const main = args => {
  try {
    main1(args)
  } catch (err) {} // eslint-disable-line no-empty
  return
}
