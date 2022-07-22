import {iface} from '@fluent-wallet/contract-abis/777.js'
import {Interface} from '@ethersproject/abi'
import {encode, validateBase32Address} from '@fluent-wallet/base32-address'
import {isHexAddress} from '@fluent-wallet/account'
import {abi} from '@fluent-wallet/confluxscan-api/contract.js'

const eip777AbiSignatures = [
  // '0x70a08231', // balanceOf
  // '0x313ce567', // decimals
  // '0x06fdde03', // name
  // '0x95d89b41', // symbol
  '0xa9059cbb', // transfer
  // '0xdd62ed3e', // allowance
  '0x095ea7b3', // approve
  // '0x556f0dc7', // granularity
  '0x9bd9bbc6', // send
  '0x23b872dd', // transferFrom
  // burn
]

export const getCFXContractMethodSignature = async (
  address,
  transactionData,
  netId,
  offlineOnly = false,
) => {
  if (!validateBase32Address(address)) {
    throw new Error('invalid base32 address')
  }

  try {
    let abiInterface
    if (eip777AbiSignatures.includes(transactionData.substring(0, 10))) {
      abiInterface = iface
    } else if (!offlineOnly) {
      const response = await abi({address, networkId: netId})
      if (!response) throw new Error('failed to parse transaction data')
      abiInterface = new Interface(response)
    } else {
      throw new Error('failed to parse transaction data')
    }

    const ret = abiInterface.parseTransaction({data: transactionData})
    if (ret.args) {
      ret.args = ret.args.map(arg =>
        isHexAddress(arg) ? encode(arg.substring(2), netId) : arg,
      )
    }
    return ret
  } catch (e) {
    throw new Error('failed to parse transaction data')
  }
}
