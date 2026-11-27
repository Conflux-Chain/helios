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
  const userAddresses = [...new Set(users.map(user => user.toLowerCase()))]
  const tokenAddresses = [...new Set(tokens.map(token => token.toLowerCase()))]

  const queryBalance = async (userAddress, tokenAddress) => {
    let balance = '0x0'

    const call =
      tokenAddress === '0x0'
        ? addr => getBalanceMethod([addr])
        : tokenContract.balanceOf(d => callMethod([d]), tokenAddress)

    try {
      balance = await call(
        type === 'cfx' && tokenAddress !== '0x0'
          ? decode(userAddress).hexAddress
          : userAddress,
      )
      if (Array.isArray(balance)) balance = balance[0]
      balance = hexValue(balance)
    } catch (err) {} // eslint-disable-line no-empty
    return balance
  }

  const entries = await Promise.all(
    userAddresses.map(async userAddress => {
      const tokenEntries = await Promise.all(
        tokenAddresses.map(async tokenAddress => [
          tokenAddress,
          await queryBalance(userAddress, tokenAddress),
        ]),
      )

      return [userAddress, Object.fromEntries(tokenEntries)]
    }),
  )

  return Object.fromEntries(entries)
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
