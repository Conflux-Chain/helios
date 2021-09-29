import addrByNet from '@fluent-wallet/addr-by-network'
import tokenContract from '@fluent-wallet/contract-abis/777.js'
import {balances} from '@fluent-wallet/single-call-balance-tracker'
import {decode} from '@fluent-wallet/base32-address'
import {hexValue} from '@ethersproject/bytes'

import {
  base32ContractAddress,
  base32UserAddress,
  blockRef,
  cat,
  catn,
  epochRef,
  eq,
  ethHexAddress,
  map,
  oneOrMore,
  or,
  zeroOrOne,
} from '@fluent-wallet/spec'

export const NAME = 'wallet_getBalance'

const GetBalanceSchema = [
  or,
  [cat, ethHexAddress, [zeroOrOne, blockRef]],
  [cat, base32UserAddress, [zeroOrOne, epochRef]],
]

const SingleCallGetBalanceSchema = [
  or,
  [
    map,
    {closed: true},
    ['users', [oneOrMore, [catn, ['user-address', base32UserAddress]]]],
    [
      'tokens',
      [
        oneOrMore,
        [
          catn,
          [
            'token-address',
            [
              or,
              {doc: 'toekn address, 0x0 represents native token'},
              [eq, '0x0'],
              base32ContractAddress,
            ],
          ],
        ],
      ],
    ],
  ],
  [
    map,
    {closed: true},
    ['users', [oneOrMore, [catn, ['user-address', ethHexAddress]]]],
    [
      'tokens',
      [
        oneOrMore,
        [
          catn,
          [
            'token-address',
            [
              or,
              {doc: 'toekn address, 0x0 represents native token'},
              [eq, '0x0'],
              ethHexAddress,
            ],
          ],
        ],
      ],
    ],
  ],
]

export const schemas = {
  input: [or, GetBalanceSchema, SingleCallGetBalanceSchema],
}

export const permissions = {
  locked: true,
  methods: ['cfx_getBalance', 'eth_getBalance', 'cfx_call', 'eth_call'],
  external: ['popup', 'inpage'],
}

async function fallbackBalanceTracker(
  callMethod,
  {
    rpcs: {cfx_getBalance, eth_getBalance},
    params: {users, tokens},
    network: {type},
  },
) {
  const getBalanceMethod = type === 'cfx' ? cfx_getBalance : eth_getBalance
  const rst = {}
  const promises = tokens.reduce((promises, t) => {
    const call =
      t === '0x0'
        ? addr => getBalanceMethod([addr])
        : tokenContract.balanceOf(d => callMethod([d]), t)
    return promises.concat(
      users.map(u => {
        return call(type === 'cfx' && t !== '0x0' ? decode(u).hexAddress : u)
          .then(res => {
            if (Array.isArray(res)) res = res[0]
            if (!rst[u]) rst[u] = {}
            rst[u][t] = hexValue(res?.toHexString?.() || res)
          })
          .catch(() => {
            if (!rst[u]) rst[u] = {}
            rst[u][t] = '0x0'
          })
      }),
    )
  }, [])

  await Promise.all(promises)

  return rst
}

export const main = async arg => {
  const {
    Err: {InvalidParams},
    rpcs: {cfx_getBalance, eth_getBalance, cfx_call, eth_call},
    params,
    network: {type, netId, balanceChecker},
  } = arg
  // normal get balance
  if (Array.isArray(params)) {
    let [address] = params
    address = addrByNet({
      address,
      networkType: type,
      networkId: netId,
      addressType: 'user',
    })

    const getBalance = type === 'cfx' ? cfx_getBalance : eth_getBalance

    return await getBalance([address])
  }

  // single call get balance
  const callMethod = type === 'cfx' ? cfx_call : eth_call
  const {users, tokens} = params

  if (
    (type === 'cfx' && !users[0].includes(':')) ||
    (type === 'eth' && users[0].includes(':'))
  )
    throw InvalidParams('Invalid address format for current network')

  if (!balanceChecker) {
    return await fallbackBalanceTracker(callMethod, arg)
  }

  let rst
  try {
    rst = await balances(d => callMethod([d]), balanceChecker, users, tokens)
  } catch (err) {
    rst = await fallbackBalanceTracker(callMethod, arg)
  }

  return rst
}
