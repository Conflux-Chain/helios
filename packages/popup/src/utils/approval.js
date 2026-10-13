import {iface} from '@fluent-wallet/contract-abis/777.js'

// amount is a base-unit integer string, in decimal or hexadecimal form.
export function updateApprovalAmount(data, amount) {
  const [spender, currentAmount] = iface.decodeFunctionData('approve', data)

  if (currentAmount.eq(amount)) {
    return data
  }

  return iface.encodeFunctionData('approve', [spender, amount])
}
