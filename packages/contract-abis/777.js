import {Interface} from '@ethersproject/abi'
import {partial} from '@fluent-wallet/compose'
import {FUNGIBLE_TOKEN_ABI} from './token-abi.js'

export {Interface} from '@ethersproject/abi'
export const ABI = FUNGIBLE_TOKEN_ABI
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
    const [, methodName] = arguments
    const f = iface.getFunction(methodName)
    if (!f) throw new Error(`Invalid contract method ${methodName}`)
    return partial(request, methodName)
  },
})

export default contractInterface
