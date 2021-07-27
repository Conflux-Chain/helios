import {MethodRegistry} from 'eth-method-registry'
import {ETH_ENDPOINT} from './constance'
import {ETH_FOUR_BYTE_DOMAIN} from './constance'
import fetchHelper from './util/fetch-helper'

// networkType must be any of Mainnet,Ropsten,Rinkeby,Kovan,Goerli
export const getETHEndpoint = networkType => {
  return Object.prototype.hasOwnProperty.call(ETH_ENDPOINT, networkType)
    ? ETH_ENDPOINT[networkType]
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

export const getEthContractMethodSignature = async (
  transactionData,
  ethProvider,
  networkType,
) => {
  try {
    let provider
    if (ethProvider) {
      provider = ethProvider
    } else {
      const Eth = (await import('ethjs')).default
      provider = new Eth.HttpProvider(getETHEndpoint(networkType))
    }

    const registry = new MethodRegistry({provider})
    const fourBytePrefix = transactionData.substr(0, 10)
    const fourByteSig = geTextSignature(fourBytePrefix).catch(() => {
      return null
    })

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
  } catch (error) {
    // console.log('error', error)
    return {}
  }
}
