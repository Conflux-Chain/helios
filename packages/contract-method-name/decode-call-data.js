import {checkResultErrors, Interface} from '@ethersproject/abi'
import {TOKEN_CALL_ABI} from '@fluent-wallet/contract-abis/token-abi.js'

const tokenCallInterface = new Interface(TOKEN_CALL_ABI)

export function decodeCallData(data, abiInterface = tokenCallInterface) {
  try {
    const decodedCall = abiInterface.parseTransaction({data})

    // Some decoding errors are deferred until an argument is read.
    if (!decodedCall || checkResultErrors(decodedCall.args).length > 0) {
      return null
    }

    return decodedCall
  } catch {
    return null
  }
}
