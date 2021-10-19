import {Interface} from '@ethersproject/abi'
import {partial} from '@fluent-wallet/compose'
import {decode as decodeBase32} from '@fluent-wallet/base32-address'
import {hexValue} from '@ethersproject/bytes'

const ABI = [
  {
    constant: true,
    inputs: [
      {name: 'users', type: 'address[]'},
      {name: 'tokens', type: 'address[]'},
    ],
    name: 'balances',
    outputs: [{name: '', type: 'uint256[]'}],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

const iface = new Interface(ABI)

const encode = (users = [], tokens = []) =>
  iface.encodeFunctionData('balances', [users, tokens])

const decode = data => iface.decodeFunctionResult('balances', data)

export const balances = async (...args) => {
  const [request, to, users = [], tokens = []] = args
  if (args.length === 1) return partial(balances, request)
  if (args.length === 2) return partial(balances, request, to)
  const data = await request({
    data: encode(
      users.map(u => (u.includes(':') ? decodeBase32(u).hexAddress : u)),
      tokens.map(t => {
        if (t === '0x0') return '0x0000000000000000000000000000000000000000'
        return t.includes(':') ? decodeBase32(t).hexAddress : t
      }),
    ),
    to,
  })

  const [decoded] = decode(data)
  const tl = tokens.length
  const rst = {}

  users.forEach((u, uidx) => {
    u = u.toLowerCase()
    rst[u] = {}
    tokens.forEach((t, tidx) => {
      t = t.toLowerCase()
      rst[u][t] = hexValue(decoded[uidx * tl + tidx].toHexString())
    })
  })

  return rst
}
