import {Interface} from '@ethersproject/abi'
import {partial} from '@fluent-wallet/compose'

const ABI = [
  {
    inputs: [{internalType: 'address', name: 'tokenHolder', type: 'address'}],
    name: 'balanceOf',
    outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{internalType: 'uint8', name: '', type: 'uint8'}],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{internalType: 'string', name: '', type: 'string'}],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{internalType: 'string', name: '', type: 'string'}],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {internalType: 'address', name: 'recipient', type: 'address'},
      {internalType: 'uint256', name: 'amount', type: 'uint256'},
    ],
    name: 'transfer',
    outputs: [{internalType: 'bool', name: '', type: 'bool'}],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {internalType: 'address', name: 'holder', type: 'address'},
      {internalType: 'address', name: 'spender', type: 'address'},
    ],
    name: 'allowance',
    outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {internalType: 'address', name: 'spender', type: 'address'},
      {internalType: 'uint256', name: 'value', type: 'uint256'},
    ],
    name: 'approve',
    outputs: [{internalType: 'bool', name: '', type: 'bool'}],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'granularity',
    outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {internalType: 'address', name: 'recipient', type: 'address'},
      {internalType: 'uint256', name: 'amount', type: 'uint256'},
      {internalType: 'bytes', name: 'data', type: 'bytes'},
    ],
    name: 'send',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {internalType: 'address', name: 'holder', type: 'address'},
      {internalType: 'address', name: 'recipient', type: 'address'},
      {internalType: 'uint256', name: 'amount', type: 'uint256'},
    ],
    name: 'transferFrom',
    outputs: [{internalType: 'bool', name: '', type: 'bool'}],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export const iface = new Interface(ABI)

const request = (...args) => {
  const [methodName, r, to, ...rest] = args
  if (args.length === 2) return partial(request, methodName, r)
  if (args.length === 3 && iface.getFunction(methodName).inputs.length > 0)
    return partial(request, methodName, r, to)
  const data = iface.encodeFunctionData(methodName, rest)
  return r({data, to}).then(res => {
    if (res?.jsonrpc && res?.result) res = res.result
    const decoded = iface.decodeFunctionResult(methodName, res)
    return decoded
  })
}

export default new Proxy(iface, {
  get() {
    const [, methodName] = arguments
    const f = iface.getFunction(methodName)
    if (!f) throw new Error(`Invalid contract method ${methodName}`)
    return partial(request, methodName)
  },
})
