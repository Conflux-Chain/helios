import {Interface} from '@ethersproject/abi'
import {decodeContractMethods} from '@fluent-wallet/confluxscan-api/contract.js'
import {
  CFX_MAINNET_NETID,
  CFX_TESTNET_NETID,
  CFX_ESPACE_MAINNET_NETID,
  CFX_ESPACE_TESTNET_NETID,
} from '@fluent-wallet/consts'
import {decodeCallData} from './decode-call-data.js'

const SCAN_NETWORK_IDS = {
  cfx: [CFX_MAINNET_NETID, CFX_TESTNET_NETID],
  eth: [CFX_ESPACE_MAINNET_NETID, CFX_ESPACE_TESTNET_NETID],
}

export async function decodeCallDataWithScan({
  networkType,
  networkId,
  contractAddress,
  data,
}) {
  if (
    !SCAN_NETWORK_IDS[networkType]?.includes(networkId) ||
    !contractAddress ||
    !data ||
    data === '0x'
  ) {
    return null
  }

  try {
    const [method] = await decodeContractMethods({
      networkId,
      contractAddress,
      inputData: data,
    })
    if (!method?.abi) return null

    const abiInterface = new Interface([JSON.parse(method.abi)])
    return decodeCallData(data, abiInterface)
  } catch {
    return null
  }
}
