import {initFetcher} from '@fluent-wallet/fetch-rpc'
import {toBundlerUserOperation} from '@fluent-wallet/user-operation'

const DEFAULT_TIMEOUT = 60_000

export class BundlerRpcError extends Error {
  constructor({code, message, data}) {
    super(message)
    this.name = 'BundlerRpcError'
    this.code = code
    this.data = data
  }
}

export function createBundlerClient({
  endpoint,
  fetcher = initFetcher(),
  timeout = DEFAULT_TIMEOUT,
}) {
  let nextRequestId = 1

  async function request(method, params) {
    const response = await fetcher
      .post(endpoint, {
        timeout,
        throwHttpErrors: false,
        json: {
          jsonrpc: '2.0',
          id: nextRequestId++,
          method,
          params,
        },
      })
      .json()

    if (response.error) {
      throw new BundlerRpcError(response.error)
    }

    return response.result
  }

  return {
    getUserOperationGasPrice() {
      return request('pimlico_getUserOperationGasPrice', [])
    },

    estimateUserOperationGas(userOperation, entryPointAddress) {
      return request('eth_estimateUserOperationGas', [
        toBundlerUserOperation(userOperation),
        entryPointAddress,
      ])
    },

    sendUserOperation(userOperation, entryPointAddress) {
      return request('eth_sendUserOperation', [
        toBundlerUserOperation(userOperation),
        entryPointAddress,
      ])
    },

    getUserOperationByHash(userOperationHash) {
      return request('eth_getUserOperationByHash', [userOperationHash])
    },

    getUserOperationReceipt(userOperationHash) {
      return request('eth_getUserOperationReceipt', [userOperationHash])
    },
  }
}
