import {Conflux} from 'js-conflux-sdk'
import {CFX_SCAN_DOMAINS} from './constance'
import fetchHelper from './util/fetch-helper'
import {ABI} from '@fluent-wallet/contract-abis/777.js'

export const eip777AbiSignatures = [
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

export const getCFXScanDomain = network => {
  return CFX_SCAN_DOMAINS[network]
}

export const getCFXAbi = async (address, network) => {
  const scanDomain = getCFXScanDomain(network)
  return await fetchHelper(
    `${scanDomain}/v1/contract/${address}?fields=abi`,
    'GET',
  )
}

export const getCFXContractMethodSignature = async (
  address,
  transactionData,
  network,
) => {
  try {
    let abi = []
    if (eip777AbiSignatures.includes(transactionData.substr(0, 10))) {
      abi = [...ABI]
    } else {
      const response = await getCFXAbi(address, network)
      abi = JSON.parse(response.abi)
    }

    return new Conflux()
      .Contract({abi, address})
      .abi.decodeData(transactionData)
  } catch (e) {
    return {}
  }
}
