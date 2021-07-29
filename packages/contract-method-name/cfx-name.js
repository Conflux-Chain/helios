import {Conflux} from 'js-conflux-sdk'
import {CFX_SCAN_TESTNET_DOMAIN, CFX_SCAN_MAINNET_DOMAIN} from './constance'
import fetchHelper from './util/fetch-helper'

// return conflux scan domain. Param networkType can be mainnet or testnet
export const getCFXScanDomain = networkType => {
  return networkType === 'mainnet'
    ? CFX_SCAN_MAINNET_DOMAIN
    : CFX_SCAN_TESTNET_DOMAIN
}
export const getCFXAbi = async (address, networkType) => {
  const scanDomain = getCFXScanDomain(networkType)
  return await fetchHelper(
    `${scanDomain}/v1/contract/${address}?fields=abi`,
    'GET',
  )
}

export const getCFXContractMethodSignature = async (
  address,
  transactionData,
  networkType,
) => {
  try {
    const response = await getCFXAbi(address, networkType)
    const abi = JSON.parse(response.abi)
    return new Conflux()
      .Contract({abi, address})
      .abi.decodeData(transactionData)
  } catch (e) {
    // console.log('error message', e)
    return {}
  }
}
