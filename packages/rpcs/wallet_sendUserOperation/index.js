import {joinSignature} from '@ethersproject/bytes'
import {SigningKey} from '@ethersproject/signing-key'
import {
  BundlerRpcError,
  createBundlerClient,
} from '@fluent-wallet/bundler-client'
import {EIP7702_NETWORK_CONFIGS} from '@fluent-wallet/consts'
import {
  resolveTransactionNonces,
  withUserOperationNonceLock,
} from '@fluent-wallet/nonce-manager'
import {
  Bytes,
  Uint,
  dbid,
  ethHexAddress,
  map,
  oneOrMore,
} from '@fluent-wallet/spec'

import {
  SMART_ACCOUNT_7702_STUB_SIGNATURE,
  createUserOperationForEstimate,
  decodeGetNonceResult,
  encodeAccountCalls,
  encodeGetNonceCall,
  getUserOperationHash,
  mergeUserOperationGasEstimate,
} from '@fluent-wallet/user-operation'

export const NAME = 'wallet_sendUserOperation'

const callSchema = [
  map,
  {closed: true},
  ['to', ethHexAddress],
  ['value', {optional: true}, Uint],
  ['data', {optional: true}, Bytes],
]

export const schemas = {
  input: [
    map,
    {closed: true},
    ['accountId', dbid],
    ['networkId', dbid],
    ['calls', [oneOrMore, callSchema]],
  ],
}

export const permissions = {
  external: [],
  methods: [
    'eth_call',
    'wallet_getAddressPrivateKey',
    'wallet_getEip7702AccountStates',
    'wallet_handleUserOperation',
  ],
  db: [
    'getAccountById',
    'getNetworkById',
    'accountAddrByNetwork',
    'getOccupiedUserOperationNonces',
    'insertUserOperation',
    'setUserOperationPending',
    'setUserOperationFailed',
  ],
}

async function validateUserOperationSender({
  InvalidParams,
  requestNetwork,
  getAccountById,
  getNetworkById,
  accountAddrByNetwork,
  wallet_getEip7702AccountStates,
  accountId,
  networkId,
}) {
  const account = getAccountById(accountId)
  if (!account) {
    throw InvalidParams(`Invalid account id ${accountId}`)
  }

  const network = getNetworkById(networkId)
  if (!network) {
    throw InvalidParams(`Invalid network id ${networkId}`)
  }

  if (requestNetwork.eid !== network.eid) {
    throw InvalidParams(
      `Network ${networkId} does not match the RPC network context`,
    )
  }

  const networkConfig = EIP7702_NETWORK_CONFIGS[network.chainId]
  if (!networkConfig) {
    throw InvalidParams(
      `UserOperation is not supported on network ${network.name}`,
    )
  }

  const vaultType = account.accountGroup?.vault?.type
  if (vaultType !== 'hd' && vaultType !== 'pk') {
    throw InvalidParams('UserOperation only supports software accounts')
  }

  const addressRecord = accountAddrByNetwork({
    account: accountId,
    network: networkId,
  })

  if (!addressRecord?.value) {
    throw InvalidParams(
      `Account ${accountId} has no address on network ${networkId}`,
    )
  }

  const [accountState] = await wallet_getEip7702AccountStates(
    {network, networkName: network.name, errorFallThrough: true},
    [{accountId, networkId}],
  )

  if (accountState.state !== 'delegatedToConfigured') {
    throw InvalidParams(
      `Account is not ready for UserOperation: ${accountState.state}`,
    )
  }

  return {
    addressId: addressRecord.eid,
    sender: addressRecord.value.toLowerCase(),
    network,
    networkConfig,
  }
}

function callEntryPoint({eth_call, entryPointAddress, data}) {
  return eth_call({errorFallThrough: true}, [
    {
      to: entryPointAddress,
      data,
    },
    'latest',
  ])
}

async function getNextUserOperationNonce({
  eth_call,
  getOccupiedUserOperationNonces,
  network,
  entryPointAddress,
  sender,
}) {
  const encodedNonce = await callEntryPoint({
    eth_call,
    entryPointAddress,
    data: encodeGetNonceCall(sender),
  })

  const networkPendingNonce = decodeGetNonceResult(encodedNonce)
  const occupiedNonces = getOccupiedUserOperationNonces({
    sender,
    chainId: network.chainId,
    entryPoint: entryPointAddress,
  })

  const [nonce] = resolveTransactionNonces({
    networkPendingNonce,
    occupiedNonces,
  })

  return nonce
}

function signUserOperationHash(userOperationHash, privateKey) {
  return joinSignature(new SigningKey(privateKey).signDigest(userOperationHash))
}

async function prepareSignedUserOperation({
  bundlerClient,
  wallet_getAddressPrivateKey,
  network,
  entryPointAddress,
  paymasterAddress,
  accountId,
  sender,
  nonce,
  calls,
}) {
  const {standard: gasPrice} = await bundlerClient.getUserOperationGasPrice()

  let userOperation = createUserOperationForEstimate({
    sender,
    nonce,
    callData: encodeAccountCalls(calls),
    maxFeePerGas: gasPrice.maxFeePerGas,
    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    signature: SMART_ACCOUNT_7702_STUB_SIGNATURE,
    paymaster: paymasterAddress,
  })

  const gasEstimate = await bundlerClient.estimateUserOperationGas(
    userOperation,
    entryPointAddress,
  )

  userOperation = mergeUserOperationGasEstimate(userOperation, gasEstimate)

  const userOpHash = getUserOperationHash({
    chainId: network.chainId,
    entryPointAddress,
    userOperation,
  })

  const privateKey = await wallet_getAddressPrivateKey(
    {errorFallThrough: true},
    {
      address: sender,
      accountId,
    },
  )

  return {
    userOpHash,
    userOperation: {
      ...userOperation,
      signature: signUserOperationHash(userOpHash, privateKey),
    },
  }
}

async function submitUserOperationToBundler({
  bundlerClient,
  entryPointAddress,
  userOperation,
  userOpHash,
  setUserOperationFailed,
  wallet_handleUserOperation,
  networkId,
}) {
  try {
    return await bundlerClient.sendUserOperation(
      userOperation,
      entryPointAddress,
    )
  } catch (error) {
    if (error instanceof BundlerRpcError) {
      // A Bundler JSON-RPC rejection is definitive.
      setUserOperationFailed({
        hash: userOpHash,
        error: {
          code: error.code,
          message: error.message,
          ...(error.data === undefined ? {} : {data: error.data}),
        },
      })
    } else {
      // Without a definitive JSON-RPC rejection, the submission outcome is unknown.
      startUserOperationTracking({
        wallet_handleUserOperation,
        hash: userOpHash,
        networkId,
      })
    }

    throw error
  }
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

export const main = async ({
  Err: {InvalidParams, Server},
  db: {
    getAccountById,
    getNetworkById,
    accountAddrByNetwork,
    getOccupiedUserOperationNonces,
    insertUserOperation,
    setUserOperationPending,
    setUserOperationFailed,
  },
  rpcs: {
    eth_call,
    wallet_getAddressPrivateKey,
    wallet_getEip7702AccountStates,
    wallet_handleUserOperation,
  },
  params: {accountId, networkId, calls},
  network: requestNetwork,
}) => {
  const {
    addressId,
    sender,
    network,
    networkConfig: {entryPointAddress, paymasterAddress, bundlerEndpoint},
  } = await validateUserOperationSender({
    InvalidParams,
    requestNetwork,
    getAccountById,
    getNetworkById,
    accountAddrByNetwork,
    wallet_getEip7702AccountStates,
    accountId,
    networkId,
  })

  const bundlerClient = createBundlerClient({
    endpoint: bundlerEndpoint,
  })

  return withUserOperationNonceLock(
    {
      chainId: network.chainId,
      entryPoint: entryPointAddress,
      sender,
    },

    async () => {
      const nonce = await getNextUserOperationNonce({
        eth_call,
        getOccupiedUserOperationNonces,
        network,
        entryPointAddress,
        sender,
      })

      const {userOperation, userOpHash} = await prepareSignedUserOperation({
        bundlerClient,
        wallet_getAddressPrivateKey,
        network,
        entryPointAddress,
        paymasterAddress,
        accountId,
        sender,
        nonce,
        calls,
      })

      insertUserOperation({
        addressId,
        hash: userOpHash,
        sender,
        chainId: network.chainId,
        entryPoint: entryPointAddress,
        nonce,
        calls,
        paymaster: paymasterAddress,
      })

      const bundlerUserOpHash = await submitUserOperationToBundler({
        bundlerClient,
        entryPointAddress,
        userOperation,
        userOpHash,
        setUserOperationFailed,
        wallet_handleUserOperation,
        networkId,
      })
      if (
        typeof bundlerUserOpHash !== 'string' ||
        bundlerUserOpHash.toLowerCase() !== userOpHash.toLowerCase()
      ) {
        // The Bundler may have accepted something, so retain "submitting".
        startUserOperationTracking({
          wallet_handleUserOperation,
          hash: userOpHash,
          networkId,
        })
        throw Server('Bundler returned an unexpected UserOperation hash')
      }

      setUserOperationPending({hash: userOpHash})

      startUserOperationTracking({
        wallet_handleUserOperation,
        hash: userOpHash,
        networkId,
      })

      return {userOpHash}
    },
  )
}
