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

export const NetworkMetaData = {
  eth: {
    71: '0x74191f6b288dff3db43b34d3637842c8146e2103', // cfx espace testnet
    1030: '0x74191f6b288dff3db43b34d3637842c8146e2103', // cfx espace
    1: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39', // ethereum
    3: '0x8D9708f3F514206486D7E988533f770a16d074a7', // ropsten
    4: '0x3183B673f4816C94BeF53958BaF93C671B7F8Cf2', // rinkeby
    42: '0x55ABBa8d669D60A10c104CC493ec5ef389EC92bb', // kovan
    56: '0x2352c63A83f9Fd126af8676146721Fa00924d7e4', // bsc
    97: '0x2352c63A83f9Fd126af8676146721Fa00924d7e4', // bsc test
    137: '0x2352c63A83f9Fd126af8676146721Fa00924d7e4', // polygon
    80001: '0x2352c63A83f9Fd126af8676146721Fa00924d7e4', // mumbai
    10: '0xB1c568e9C3E6bdaf755A60c7418C269eb11524FC', // optimism
    69: '0xB1c568e9C3E6bdaf755A60c7418C269eb11524FC', // optimism kovan
    42161: '0x151E24A486D7258dd7C33Fb67E4bB01919B7B32c', // arbitrum
  },
  cfx: {
    1029: 'cfx:achxne2gfh8snrstkxn0f32ua2cf19zwky2y66hj2d', // cfx mainnet
    1: 'cfxtest:achxne2gfh8snrstkxn0f32ua2cf19zwkyw9tpbc6k', // cfx testnet
  },
}
