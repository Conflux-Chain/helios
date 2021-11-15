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
  zeroOrOne,
  epochRefNoMined,
  eq,
  ethHexAddress,
  map,
  oneOrMore,
  or,
} from '@fluent-wallet/spec'

export const NAME = 'wallet_getBalance'

const GetBalanceSchema = [
  or,
  [cat, ethHexAddress, [zeroOrOne, blockRef]],
  [cat, base32UserAddress, [zeroOrOne, epochRefNoMined]],
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
              {doc: 'token address, 0x0 represents native token'},
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
              {doc: 'token address, 0x0 represents native token'},
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

const fallbackBalanceTracker = async (
  callMethod,
  {
    rpcs: {cfx_getBalance, eth_getBalance},
    params: {users, tokens},
    network: {type},
  },
) => {
  const getBalanceMethod = type === 'cfx' ? cfx_getBalance : eth_getBalance
  const rst = {}
  const promises = users.reduce((acc, u) => {
    u = u.toLowerCase()
    if (!rst[u]) rst[u] = {}
    return acc.concat(
      tokens.map(async t => {
        let res = '0x0'
        t = t.toLowerCase()

        const call =
          t === '0x0'
            ? addr => getBalanceMethod([addr])
            : tokenContract.balanceOf(d => callMethod([d]), t)

        try {
          res = await call(
            type === 'cfx' && t !== '0x0' ? decode(u).hexAddress : u,
          )
          if (Array.isArray(res)) res = res[0]
          res = hexValue(res?.toHexString?.() || res)
        } catch (err) {} // eslint-disable-line no-empty
        rst[u][t] = res
        return res
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

  let rst

  if (!balanceChecker) {
    rst = await fallbackBalanceTracker(callMethod, arg)
    return rst
  }

  try {
    rst = await balances(
      d => callMethod({errorFallThrough: true}, [d]),
      balanceChecker,
      users,
      tokens,
    )
  } catch (err) {} // eslint-disable-line no-empty

  if (rst === undefined) {
    rst = await fallbackBalanceTracker(callMethod, arg)
  }

  return rst
}
