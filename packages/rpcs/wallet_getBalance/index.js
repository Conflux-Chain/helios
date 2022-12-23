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
    ['users', [oneOrMore, base32UserAddress]],
    [
      'tokens',
      [
        oneOrMore,
        [
          or,
          {doc: 'token address, 0x0 represents native token'},
          [eq, '0x0'],
          base32ContractAddress,
        ],
      ],
    ],
  ],
  [
    map,
    {closed: true},
    ['users', [oneOrMore, ethHexAddress]],
    [
      'tokens',
      [
        oneOrMore,
        [
          or,
          {doc: 'token address, 0x0 represents native token'},
          [eq, '0x0'],
          ethHexAddress,
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
        // 拿 native token 余额 和 token 20余额
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
  //如果没有 balanceChecker 合约 就直接call
  if (!balanceChecker) {
    rst = await fallbackBalanceTracker(callMethod, arg)
    return rst
  }
  // 如果用 balanceChecker 也是直接call 只不过这里的to address(合约地址) 是balance checker.上面的是 token 的address
  // balance checker 其实就是提供了一个 balances 的abi 逻辑和上面的那个一样
  // 也是拿到加密的data 传给 call 函数
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
