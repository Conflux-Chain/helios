import {decodeContractMethods} from '@fluent-wallet/confluxscan-api/contract'
import {
  CFX_ESPACE_MAINNET_NETID,
  CFX_ESPACE_TESTNET_NETID,
} from '@fluent-wallet/consts'
import {iface, Interface} from '@fluent-wallet/contract-abis/777.js'

export const getEthContractMethodSignature = async (
  contractAddress,
  transactionData,
  networkId,
  offlineOnly = false,
) => {
  try {
    let abiInterface = iface

    // Only decode for Conflux eSpace networks
    if (
      (networkId === CFX_ESPACE_MAINNET_NETID ||
        networkId === CFX_ESPACE_TESTNET_NETID) &&
      !offlineOnly
    ) {
      const decodedMethods = await decodeContractMethods({
        networkId,
        contractAddress,
        inputData: transactionData,
      })

      if (Array.isArray(decodedMethods) && decodedMethods.length > 0) {
        const abiItem = decodedMethods[0]
        if (abiItem?.abi) {
          abiInterface = new Interface([JSON.parse(abiItem.abi)])
        }
      }
    }

    if (!abiInterface) throw new Error('failed to parse transaction data')

    return abiInterface.parseTransaction({data: transactionData})
  } catch (error) {
    throw new Error('failed to parse transaction data')
  }
}
