import {initFetcher} from '@fluent-wallet/fetch-rpc'
import {toBundlerUserOperation} from '@fluent-wallet/user-operation'

const DEFAULT_TIMEOUT = 60_000

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
        json: {
          jsonrpc: '2.0',
          id: nextRequestId++,
          method,
          params,
        },
      })
      .json()

    if (response.error) {
      const error = new Error(response.error.message)
      error.code = response.error.code
      error.data = response.error.data
      throw error
    }

    return response.result
  }

  return {
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
