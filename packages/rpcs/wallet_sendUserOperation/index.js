import {joinSignature} from '@ethersproject/bytes'
import {SigningKey} from '@ethersproject/signing-key'
import {
  BundlerRpcError,
  createBundlerClient,
} from '@fluent-wallet/bundler-client'
import {
  EIP7702_NETWORK_CONFIGS,
  USER_OPERATION_ERROR_CODES,
} from '@fluent-wallet/consts'
import {
  resolveTransactionNonces,
  withEthereumNonceLock,
  withUserOperationNonceLock,
} from '@fluent-wallet/nonce-manager'
import {signEip7702Authorization} from '@fluent-wallet/signature'
import {
  Bytes,
  Uint,
  dbid,
  ethHexAddress,
  map,
  oneOrMore,
} from '@fluent-wallet/spec'

import {
  EIP7702_AUTHORIZATION_STUB_SIGNATURE,
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
    'eth_getTransactionCount',
    'wallet_getAddressPrivateKey',
    'wallet_getEip7702AccountStates',
    'wallet_getEthereumNonceState',
    'wallet_handleUserOperation',
  ],
  db: [
    'getAccountById',
    'getNetworkById',
    'accountAddrByNetwork',
    'getOccupiedUserOperationNonces',
    'insertUserOperation',
    'setUserOperationFailed',
  ],
}

async function getEip7702AccountState({
  wallet_getEip7702AccountStates,
  network,
  accountId,
  networkId,
}) {
  const [accountState] = await wallet_getEip7702AccountStates(
    {network, networkName: network.name, errorFallThrough: true},
    [{accountId, networkId}],
  )

  return accountState
}

function createUnsupportedDelegationStateError(Server, state) {
  const error = Server(`Account is not ready for UserOperation: ${state}`)
  error.extra = {
    code: USER_OPERATION_ERROR_CODES.UNSUPPORTED_DELEGATION_STATE,
    state,
  }
  return error
}

async function validateUserOperationSender({
  InvalidParams,
  Server,
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

  const accountState = await getEip7702AccountState({
    wallet_getEip7702AccountStates,
    network,
    accountId,
    networkId,
  })

  if (
    accountState.state !== 'notDelegated' &&
    accountState.state !== 'delegatedToConfigured'
  ) {
    throw createUnsupportedDelegationStateError(Server, accountState.state)
  }

  return {
    addressId: addressRecord.eid,
    sender: addressRecord.value.toLowerCase(),
    network,
    networkConfig,
    delegationState: accountState.state,
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

async function getEip7702AuthorizationNonce({
  Server,
  eth_getTransactionCount,
  wallet_getEthereumNonceState,
  network,
  sender,
}) {
  const [{networkPendingNonce, occupiedNonces}, networkLatestNonce] =
    await Promise.all([
      wallet_getEthereumNonceState(
        {
          errorFallThrough: true,
          network,
        },
        [sender],
      ),
      eth_getTransactionCount(
        {
          errorFallThrough: true,
          networkName: network.name,
          _cacheConf: {type: null},
        },
        [sender, 'latest'],
      ),
    ])

  // A 7702 authorization must use the current EOA nonce; it cannot skip pending transactions.
  if (networkLatestNonce !== networkPendingNonce || occupiedNonces.length > 0) {
    const error = Server('Pending transaction blocks first EIP-7702 delegation')
    error.extra = {
      code: USER_OPERATION_ERROR_CODES.EIP7702_PENDING_TRANSACTION,
    }
    throw error
  }

  return networkLatestNonce
}

function signUserOperationHash(userOperationHash, privateKey) {
  return joinSignature(new SigningKey(privateKey).signDigest(userOperationHash))
}

function signUserOperationAuthorization(authorization, privateKey) {
  return {
    ...authorization,
    ...signEip7702Authorization(
      {
        chainId: authorization.chainId,
        contractAddress: authorization.address,
        nonce: authorization.nonce,
      },
      privateKey,
    ),
  }
}

async function prepareUserOperationForEstimate({
  bundlerClient,
  entryPointAddress,
  paymasterAddress,
  sender,
  nonce,
  calls,
  authorization,
}) {
  const {standard: gasPrice} = await bundlerClient.getUserOperationGasPrice()
  const authorizationForEstimate = authorization
    ? {...authorization, ...EIP7702_AUTHORIZATION_STUB_SIGNATURE}
    : undefined

  const userOperationForEstimate = createUserOperationForEstimate({
    sender,
    nonce,
    callData: encodeAccountCalls(calls),
    maxFeePerGas: gasPrice.maxFeePerGas,
    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    signature: SMART_ACCOUNT_7702_STUB_SIGNATURE,
    paymaster: paymasterAddress,
    authorization: authorizationForEstimate,
  })

  const gasEstimate = await bundlerClient.estimateUserOperationGas(
    userOperationForEstimate,
    entryPointAddress,
  )

  return mergeUserOperationGasEstimate(userOperationForEstimate, gasEstimate)
}

async function signUserOperationForSubmission({
  wallet_getAddressPrivateKey,
  network,
  entryPointAddress,
  accountId,
  sender,
  estimatedUserOperation,
  authorization,
}) {
  const privateKey = await wallet_getAddressPrivateKey(
    {errorFallThrough: true},
    {
      address: sender,
      accountId,
    },
  )

  const userOperationForSubmission = authorization
    ? {
        ...estimatedUserOperation,
        authorization: signUserOperationAuthorization(
          authorization,
          privateKey,
        ),
      }
    : estimatedUserOperation

  const userOpHash = getUserOperationHash({
    chainId: network.chainId,
    entryPointAddress,
    userOperation: userOperationForSubmission,
  })

  return {
    userOpHash,
    userOperation: {
      ...userOperationForSubmission,
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
    setUserOperationFailed,
  },
  rpcs: {
    eth_call,
    eth_getTransactionCount,
    wallet_getAddressPrivateKey,
    wallet_getEip7702AccountStates,
    wallet_getEthereumNonceState,
    wallet_handleUserOperation,
  },
  params: {accountId, networkId, calls},
  network: requestNetwork,
}) => {
  const {addressId, sender, network, networkConfig, delegationState} =
    await validateUserOperationSender({
      InvalidParams,
      Server,
      requestNetwork,
      getAccountById,
      getNetworkById,
      accountAddrByNetwork,
      wallet_getEip7702AccountStates,
      accountId,
      networkId,
    })

  const {entryPointAddress, paymasterAddress, bundlerEndpoint} = networkConfig

  const bundlerClient = createBundlerClient({
    endpoint: bundlerEndpoint,
  })

  const sendUserOperation = authorization =>
    withUserOperationNonceLock(
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

        const estimatedUserOperation = await prepareUserOperationForEstimate({
          bundlerClient,
          entryPointAddress,
          paymasterAddress,
          sender,
          nonce,
          calls,
          authorization,
        })

        const {userOperation, userOpHash} =
          await signUserOperationForSubmission({
            wallet_getAddressPrivateKey,
            network,
            entryPointAddress,
            accountId,
            sender,
            estimatedUserOperation,
            authorization,
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
          authorizationNonce: authorization?.nonce,
          delegateAddress: authorization?.address,
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
          // The Bundler may have accepted the operation, so keep tracking it.
          startUserOperationTracking({
            wallet_handleUserOperation,
            hash: userOpHash,
            networkId,
          })
          throw Server('Bundler returned an unexpected UserOperation hash')
        }

        startUserOperationTracking({
          wallet_handleUserOperation,
          hash: userOpHash,
          networkId,
        })

        return {userOpHash}
      },
    )

  if (delegationState === 'delegatedToConfigured') {
    return sendUserOperation()
  }

  // A first delegation shares the EOA nonce domain with regular transactions.
  return withEthereumNonceLock(
    {
      chainId: network.chainId,
      address: sender,
    },
    async () => {
      // Delegation may have completed while this request was waiting for the nonce lock.
      const currentAccountState = await getEip7702AccountState({
        wallet_getEip7702AccountStates,
        network,
        accountId,
        networkId,
      })

      if (currentAccountState.state === 'delegatedToConfigured') {
        return sendUserOperation()
      }

      if (currentAccountState.state === 'notDelegated') {
        const authorizationNonce = await getEip7702AuthorizationNonce({
          Server,
          eth_getTransactionCount,
          wallet_getEthereumNonceState,
          network,
          sender,
        })

        return sendUserOperation({
          chainId: network.chainId,
          address: networkConfig.delegateAddress,
          nonce: authorizationNonce,
        })
      }

      throw createUnsupportedDelegationStateError(
        Server,
        currentAccountState.state,
      )
    },
  )
}
