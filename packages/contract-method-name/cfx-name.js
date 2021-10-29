import {Conflux} from 'js-conflux-sdk'
import {CFX_SCAN_TESTNET_DOMAIN, CFX_SCAN_MAINNET_DOMAIN} from './constance'
import fetchHelper from './util/fetch-helper'

const abiWithSignatureObj = {
  '0x70a08231': {
    inputs: [{internalType: 'address', name: 'tokenHolder', type: 'address'}],
    name: 'balanceOf',
    outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
    stateMutability: 'view',
    type: 'function',
  },
  '0x313ce567': {
    inputs: [],
    name: 'decimals',
    outputs: [{internalType: 'uint8', name: '', type: 'uint8'}],
    stateMutability: 'pure',
    type: 'function',
  },
  '0x06fdde03': {
    inputs: [],
    name: 'name',
    outputs: [{internalType: 'string', name: '', type: 'string'}],
    stateMutability: 'view',
    type: 'function',
  },
  '0x95d89b41': {
    inputs: [],
    name: 'symbol',
    outputs: [{internalType: 'string', name: '', type: 'string'}],
    stateMutability: 'view',
    type: 'function',
  },
  '0xa9059cbb': {
    inputs: [
      {internalType: 'address', name: 'recipient', type: 'address'},
      {internalType: 'uint256', name: 'amount', type: 'uint256'},
    ],
    name: 'transfer',
    outputs: [{internalType: 'bool', name: '', type: 'bool'}],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  '0xdd62ed3e': {
    inputs: [
      {internalType: 'address', name: 'holder', type: 'address'},
      {internalType: 'address', name: 'spender', type: 'address'},
    ],
    name: 'allowance',
    outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
    stateMutability: 'view',
    type: 'function',
  },
  '0x095ea7b3': {
    inputs: [
      {internalType: 'address', name: 'spender', type: 'address'},
      {internalType: 'uint256', name: 'value', type: 'uint256'},
    ],
    name: 'approve',
    outputs: [{internalType: 'bool', name: '', type: 'bool'}],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  '0x556f0dc7': {
    inputs: [],
    name: 'granularity',
    outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
    stateMutability: 'view',
    type: 'function',
  },
  '0x9bd9bbc6': {
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
  '0x23b872dd': {
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
}
// return conflux scan domain. Param networkType can be mainnet or testnet
export const getCFXScanDomain = networkType => {
  return networkType === 'CFX_MAINNET'
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
    let abi = []
    if (abiWithSignatureObj[transactionData.substr(0, 10)]) {
      abi = [abiWithSignatureObj[transactionData.substr(0, 10)]]
    } else {
      const response = await getCFXAbi(address, networkType)
      abi = JSON.parse(response.abi)
    }

    return new Conflux()
      .Contract({abi, address})
      .abi.decodeData(transactionData)
  } catch (e) {
    return {}
  }
}
