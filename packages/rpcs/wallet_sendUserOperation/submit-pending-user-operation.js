import {
  BundlerRpcError,
  createBundlerClient,
} from '@fluent-wallet/bundler-client'

// These ERC-7769 / JSON-RPC errors prove that the Bundler rejected the
// UserOperation. Transport errors and unknown RPC errors do not prove that
// the request was not accepted.
const DEFINITIVE_REJECTION_CODES = new Set([
  -32602, -32500, -32501, -32502, -32503, -32504, -32505, -32507, -32508,
])

function isDefinitiveBundlerRejection(error) {
  return (
    error instanceof BundlerRpcError &&
    DEFINITIVE_REJECTION_CODES.has(error.code)
  )
}

function startUserOperationTracking({
  wallet_handleUserOperation,
  hash,
  networkId,
}) {
  // The handler owns polling errors; its promise must not affect the send RPC.
  void wallet_handleUserOperation(
    {errorFallThrough: true},
    {hash, networkId},
  ).catch(() => {})
}

function serializeBundlerError(error) {
  return {
    code: error.code,
    message: error.message,
    ...(error.data === undefined ? {} : {data: error.data}),
  }
}

export async function submitPendingUserOperation(
  {userOperation, userOpHash, networkId, entryPointAddress, bundlerEndpoint},
  {setUserOperationFailed, wallet_handleUserOperation, Server},
) {
  try {
    const bundlerClient = createBundlerClient({endpoint: bundlerEndpoint})
    const bundlerUserOpHash = await bundlerClient.sendUserOperation(
      userOperation,
      entryPointAddress,
    )

    if (
      typeof bundlerUserOpHash !== 'string' ||
      bundlerUserOpHash.toLowerCase() !== userOpHash.toLowerCase()
    ) {
      // The operation may still have reached the Bundler. A mismatched
      // response is therefore treated as an uncertain submission result.
      throw Server('Bundler returned an unexpected UserOperation hash')
    }
  } catch (error) {
    if (isDefinitiveBundlerRejection(error)) {
      setUserOperationFailed({
        hash: userOpHash,
        error: serializeBundlerError(error),
      })
    } else {
      startUserOperationTracking({
        wallet_handleUserOperation,
        hash: userOpHash,
        networkId,
      })
    }

    throw error
  }

  startUserOperationTracking({
    wallet_handleUserOperation,
    hash: userOpHash,
    networkId,
  })
}
