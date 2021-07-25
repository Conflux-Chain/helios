import {Conflux} from 'js-conflux-sdk'
import {
  CFX_SCAN_TESTNET_DOMAIN,
  CFX_SCAN_MAINNET_DOMAIN,
} from '@cfxjs/fluent-wallet-consts'

import {initFetcher} from '@cfxjs/fetch-rpc'

const fetcher = initFetcher()

const scanDomain =
  import.meta.env.NODE_ENV === 'production'
    ? CFX_SCAN_MAINNET_DOMAIN
    : CFX_SCAN_TESTNET_DOMAIN

const getAbiRes = async address => {
  return await fetcher
    .get(`${scanDomain}/v1/contract/${address}?fields=abi`)
    .then(res => res)
    .catch(() => null)
}

export default async (address, transactionData) => {
  try {
    const response = await getAbiRes(address)
    if (response.ok) {
      const responseJson = await response.json()
      const abi = JSON.parse(responseJson.abi)
      return new Conflux()
        .Contract({abi, address})
        .abi.decodeData(transactionData)
    }
  } catch (e) {
    return {}
  }
}
