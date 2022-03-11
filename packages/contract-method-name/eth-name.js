import {MethodRegistry} from 'eth-method-registry'
import {iface} from '@fluent-wallet/contract-abis/777.js'
import HttpProvider from 'ethjs-provider-http'
import {ETH_ENDPOINT} from './constance'
import {ETH_FOUR_BYTE_DOMAIN} from './constance'
import fetchHelper from './util/fetch-helper'

// chainId must be one of Mainnet,Ropsten,Rinkeby,Kovan,Goerli
const getETHEndpoint = chainId => {
  return Object.prototype.hasOwnProperty.call(ETH_ENDPOINT, chainId)
    ? ETH_ENDPOINT[chainId]
    : null
}

export const geTextSignature = async fourBytePrefix => {
  if (
    typeof fourBytePrefix === 'string' &&
    fourBytePrefix.length === 10 &&
    fourBytePrefix.substr(0, 2) === '0x'
  ) {
    const res = await fetchHelper(
      `${ETH_FOUR_BYTE_DOMAIN}/api/v1/signatures/?hex_signature=${fourBytePrefix}`,
      'GET',
    )
    if (res?.count === 1) {
      return res.results[0].text_signature
    }
  }

  return null
}

// Attempts to return the method data from the MethodRegistry library.
export const getEthMethodData = async (
  transactionData,
  ethProvider,
  chainId,
) => {
  try {
    const provider = ethProvider || new HttpProvider(getETHEndpoint(chainId))
    const registry = new MethodRegistry({provider})
    const fourBytePrefix = transactionData.substr(0, 10)
    const fourByteSig = await geTextSignature(fourBytePrefix)

    let sig = await registry.lookup(fourBytePrefix)

    if (!sig) {
      sig = await fourByteSig
    }
    const parsedResult = registry.parse(sig)

    return {
      fullName: sig,
      name: parsedResult.name,
      params: parsedResult.args,
    }
  } catch (e) {
    throw new Error('failed to get method data')
  }
}

export const getEthContractMethodSignature = transactionData => {
  try {
    return iface.parseTransaction({data: transactionData})
  } catch (e) {
    return undefined
  }
}
