import {Interface} from '@ethersproject/abi'
import {partial} from '@fluent-wallet/compose'
export {Interface} from '@ethersproject/abi'
export const ABI = [
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
  // r 这里是主要调用的函数其实就是传进来 eth call或者cfx call
  // 通过 encodeFunctionData 获得 call data
  // 然后把 call data 传给r 函数 调用eth call /cfx call
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

export async function validateTokenInfo(...args) {
  const [callMethod, {symbol, name, decimals, address, userAddress}] = args
  if (args.length === 1) return partial(validateTokenInfo, args[0])
  let rst = {valid: true}
  try {
    const calls = [
      contractInterface.symbol(callMethod, address),
      contractInterface.name(callMethod, address),
      contractInterface.decimals(callMethod, address),
    ]
    if (userAddress)
      calls.push(contractInterface.balanceOf(callMethod, address, userAddress))
    const [[symbolRst], [nameRst], [decimalsRst], balance] = await Promise.all(
      calls,
    )

    rst.symbol = symbolRst
    if (symbol && symbolRst !== symbol) rst.valid = false
    rst.name = nameRst
    if (name && nameRst !== name) rst.valid = false
    rst.decimals = decimalsRst
    if (decimals !== undefined && parseInt(decimalsRst) !== parseInt(decimals))
      rst.valid = false
    if (balance) rst.balance = balance?.[0]?.toHexString?.()
  } catch (err) {
    rst.valid = false
  }

  return rst
}

const contractInterface = new Proxy(iface, {
  get() {
    // methodName 是 外部调用的合约name
    const [, methodName] = arguments
    const f = iface.getFunction(methodName)
    if (!f) throw new Error(`Invalid contract method ${methodName}`)
    // 偏函数 把methodName传递进去
    return partial(request, methodName)
  },
})

export default contractInterface
