import {CFX_SCAN_DOMAINS} from './constance'
import fetchHelper from './util/fetch-helper'
import {iface} from '@fluent-wallet/contract-abis/777.js'
import {Interface} from '@ethersproject/abi'
import {encode, validateBase32Address} from '@fluent-wallet/base32-address'
import {isHexAddress} from '@fluent-wallet/account'

const eip777AbiSignatures = [
  '0x70a08231',
  '0x313ce567',
  '0x06fdde03',
  '0x95d89b41',
  '0xa9059cbb',
  '0xdd62ed3e',
  '0x095ea7b3',
  '0x556f0dc7',
  '0x9bd9bbc6',
  '0x23b872dd',
]

export const getCFXScanDomain = netId => {
  return CFX_SCAN_DOMAINS[`${netId}`]
}

export const getCFXAbi = async (address, netId) => {
  const scanDomain = getCFXScanDomain(netId)
  return await fetchHelper(
    `${scanDomain}/v1/contract/${address}?fields=abi`,
    'GET',
  )
}

export const getCFXContractMethodSignature = async (
  address,
  transactionData,
  netId,
) => {
  // eslint-disable-next-line no-useless-catch
  try {
    if (!validateBase32Address(address)) {
      return {}
      // throw new Error('inValidate base32 address')
    }
    let abiInterface
    if (eip777AbiSignatures.includes(transactionData.substr(0, 10))) {
      abiInterface = iface
    } else {
      const response = await getCFXAbi(address, netId)
      abiInterface = new Interface(JSON.parse(response.abi))
    }

    const ret = abiInterface.parseTransaction({data: transactionData})
    if (ret.args) {
      ret.args = ret.args.map(arg =>
        isHexAddress(arg) ? encode(arg.substr(2), netId) : arg,
      )
    }
    return ret
  } catch (e) {
    return {}
    // throw e
  }
}
