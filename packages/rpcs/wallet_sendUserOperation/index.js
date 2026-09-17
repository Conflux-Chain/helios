import {joinSignature} from '@ethersproject/bytes'
import {SigningKey} from '@ethersproject/signing-key'
import {
  EIP7702_NETWORK_CONFIGS,
  USER_OPERATION_ERROR_CODES,
} from '@fluent-wallet/consts'
import {
  hasEip7702AuthorizationNonceConflict,
  resolveTransactionNonces,
  withEthereumNonceLock,
  withUserOperationNonceLock,
} from '@fluent-wallet/nonce-manager'
import {signEip7702Authorization} from '@fluent-wallet/signature'

import {
  Bytes,
  Uint,
  dbid,
  enums,
  ethHexAddress,
  map,
  oneOrMore,
} from '@fluent-wallet/spec'

import {
  decodeVerifyingPaymasterData,
  getUserOperationHash,
} from '@fluent-wallet/user-operation'
import {submitPendingUserOperation} from './submit-pending-user-operation.js'

export {submitPendingUserOperation}

export const NAME = 'wallet_sendUserOperation'

const callSchema = [
  map,
  {closed: true},
  ['to', ethHexAddress],
  ['value', {optional: true}, Uint],
  ['data', {optional: true}, Bytes],
]

const userOperationAuthorizationSchema = [
  map,
  {closed: true},
  ['chainId', Uint],
  ['address', ethHexAddress],
  ['nonce', Uint],
  ['r', Bytes],
  ['s', Bytes],
  ['yParity', Uint],
]

const sponsoredUserOperationSchema = [
  map,
  {closed: true},
  ['sender', ethHexAddress],
  ['nonce', Uint],
  ['factory', {optional: true}, Bytes],
  ['factoryData', {optional: true}, Bytes],
  ['callData', Bytes],
  ['authorization', {optional: true}, userOperationAuthorizationSchema],
  ['verificationGasLimit', Uint],
  ['callGasLimit', Uint],
  ['preVerificationGas', Uint],
  ['maxFeePerGas', Uint],
  ['maxPriorityFeePerGas', Uint],
  ['signature', Bytes],
  ['paymaster', ethHexAddress],
  ['paymasterVerificationGasLimit', Uint],
  ['paymasterPostOpGasLimit', Uint],
  ['paymasterData', Bytes],
]

export const sponsorshipSchema = [
  map,
  {closed: true},
  ['userOperation', sponsoredUserOperationSchema],
]

export const schemas = {
  input: [
    map,
    {closed: true},
    ['accountId', dbid],
    ['networkId', dbid],
    ['appId', {optional: true}, dbid],
    ['calls', [oneOrMore, callSchema]],
    [
      'approvedDelegationAction',
      {optional: true},
      [enums, 'upgrade', 'switch'],
    ],
    ['sponsorship', {optional: true}, sponsorshipSchema],
  ],
}

export const permissions = {
  external: ['popup'],
  methods: [
    'eth_getTransactionCount',
    'wallet_getAddressPrivateKey',
    'wallet_getEip7702AccountStates',
    'wallet_getEthereumNonceState',
    'wallet_getUserOperationNonceState',
    'wallet_handleUserOperation',
    'wallet_prepareUserOperation',
  ],
  db: [
    'findAccount',
    'getNetworkById',
    'accountAddrByNetwork',
    'insertUserOperation',
    'setUserOperationFailed',
  ],
}

function createSponsorshipRefreshRequiredError(Server) {
  const error = Server('Sponsorship must be refreshed')
  error.extra = {
    code: USER_OPERATION_ERROR_CODES.SPONSORSHIP_REFRESH_REQUIRED,
  }
  return error
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

function createDelegationConfirmationRequiredError(Server, action) {
  const error = Server(`EIP-7702 ${action} was not confirmed by the user`)
  error.extra = {
    code: USER_OPERATION_ERROR_CODES.EIP7702_DELEGATION_CONFIRMATION_REQUIRED,
    requiredDelegationAction: action,
  }
  return error
}

async function validateUserOperationSender({
  InvalidParams,
  Server,
  requestNetwork,
  findAccount,
  getNetworkById,
  accountAddrByNetwork,
  wallet_getEip7702AccountStates,
  accountId,
  networkId,
}) {
  const account = findAccount({
    accountId,
    g: {_accountGroup: {vault: {type: 1}}},
  })
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

  const vaultType = account.accountGroup.vault.type
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
    accountState.state !== 'delegatedToConfigured' &&
    accountState.state !== 'delegatedToOther'
  ) {
    throw createUnsupportedDelegationStateError(Server, accountState.state)
  }

  return {
    addressId: addressRecord.eid,
    sender: addressRecord.value.toLowerCase(),
    network,
    networkConfig,
    accountState,
  }
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
  if (
    hasEip7702AuthorizationNonceConflict({
      networkLatestNonce,
      networkPendingNonce,
      occupiedNonces,
    })
  ) {
    const error = Server(
      'Pending transaction blocks EIP-7702 delegation authorization',
    )
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

async function signUserOperationForSubmission({
  wallet_getAddressPrivateKey,
  network,
  entryPointAddress,
  accountId,
  sender,
  preparedUserOperation,
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
        ...preparedUserOperation,
        authorization: signUserOperationAuthorization(
          authorization,
          privateKey,
        ),
      }
    : preparedUserOperation

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

export async function createPendingUserOperation({
  Err: {InvalidParams, Server},
  db: {findAccount, getNetworkById, accountAddrByNetwork, insertUserOperation},
  rpcs: {
    eth_getTransactionCount,
    wallet_getAddressPrivateKey,
    wallet_getEip7702AccountStates,
    wallet_getEthereumNonceState,
    wallet_getUserOperationNonceState,
    wallet_prepareUserOperation,
  },
  params: {
    accountId,
    networkId,
    appId,
    bundleId,
    calls,
    approvedDelegationAction,
    sponsorship,
  },
  network: requestNetwork,
}) {
  const {addressId, sender, network, networkConfig, accountState} =
    await validateUserOperationSender({
      InvalidParams,
      Server,
      requestNetwork,
      findAccount,
      getNetworkById,
      accountAddrByNetwork,
      wallet_getEip7702AccountStates,
      accountId,
      networkId,
    })

  const {entryPointAddress, bundlerEndpoint} = networkConfig

  const createPendingOperation = ({authorization, delegateAddress}) =>
    withUserOperationNonceLock(
      {
        chainId: network.chainId,
        entryPoint: entryPointAddress,
        sender,
      },
      async () => {
        const nonceState = await wallet_getUserOperationNonceState(
          {errorFallThrough: true, network},
          [sender],
        )
        const [nonce] = resolveTransactionNonces({
          networkPendingNonce: nonceState.networkPendingNonce,
          occupiedNonces: nonceState.occupiedNonces,
        })

        let preparedUserOperation

        if (sponsorship) {
          const sponsoredUserOperation = sponsorship.userOperation
          const sponsoredAuthorizationAddress =
            sponsoredUserOperation.authorization?.address?.toLowerCase()
          const authorizationAddress = authorization?.address?.toLowerCase()
          const {delegateAddress: sponsoredDelegateAddress, validUntil} =
            decodeVerifyingPaymasterData(sponsoredUserOperation.paymasterData)

          const sponsorshipNeedsRefresh =
            sponsoredUserOperation.nonce !== nonce ||
            sponsoredAuthorizationAddress !== authorizationAddress ||
            sponsoredDelegateAddress.toLowerCase() !==
              delegateAddress.toLowerCase()

          if (sponsorshipNeedsRefresh) {
            throw createSponsorshipRefreshRequiredError(Server)
          }

          if (validUntil <= Math.floor(Date.now() / 1000)) {
            throw createSponsorshipRefreshRequiredError(Server)
          }

          preparedUserOperation = sponsoredUserOperation
        } else {
          const prepared = await wallet_prepareUserOperation(
            {errorFallThrough: true, network},
            {
              sender,
              nonce,
              calls,
              ...(authorization ? {authorization} : {}),
            },
          )

          preparedUserOperation = prepared.userOperation
        }

        const {userOperation, userOpHash} =
          await signUserOperationForSubmission({
            wallet_getAddressPrivateKey,
            network,
            entryPointAddress,
            accountId,
            sender,
            preparedUserOperation,
            authorization,
          })

        insertUserOperation({
          addressId,
          appId,
          bundleId,
          hash: userOpHash,
          sender,
          chainId: network.chainId,
          entryPoint: entryPointAddress,
          nonce,
          calls,
          paymaster: preparedUserOperation.paymaster,
          authorizationNonce: authorization?.nonce,
          delegateAddress: authorization?.address,
        })

        return {
          userOperation,
          userOpHash,
          networkId,
          entryPointAddress,
          bundlerEndpoint,
        }
      },
    )

  if (accountState.state === 'delegatedToConfigured') {
    return createPendingOperation({
      delegateAddress: accountState.delegatedAddress,
    })
  }

  // Delegation authorization shares the EOA nonce with regular transactions.
  return withEthereumNonceLock(
    {
      chainId: network.chainId,
      address: sender,
    },
    async () => {
      // Delegation may have changed while waiting for the nonce lock.
      const currentAccountState = await getEip7702AccountState({
        wallet_getEip7702AccountStates,
        network,
        accountId,
        networkId,
      })

      if (currentAccountState.state === 'delegatedToConfigured') {
        return createPendingOperation({
          delegateAddress: currentAccountState.delegatedAddress,
        })
      }

      const requiredDelegationAction =
        currentAccountState.state === 'notDelegated'
          ? 'upgrade'
          : currentAccountState.state === 'delegatedToOther'
          ? 'switch'
          : null

      if (!requiredDelegationAction) {
        throw createUnsupportedDelegationStateError(
          Server,
          currentAccountState.state,
        )
      }

      if (approvedDelegationAction !== requiredDelegationAction) {
        throw createDelegationConfirmationRequiredError(
          Server,
          requiredDelegationAction,
        )
      }

      const authorizationNonce = await getEip7702AuthorizationNonce({
        Server,
        eth_getTransactionCount,
        wallet_getEthereumNonceState,
        network,
        sender,
      })

      const delegateAddress = currentAccountState.preferredDelegateAddress

      return createPendingOperation({
        delegateAddress,
        authorization: {
          chainId: network.chainId,
          address: delegateAddress,
          nonce: authorizationNonce,
        },
      })
    },
  )
}

export const main = async args => {
  const pendingUserOperation = await createPendingUserOperation(args)

  await submitPendingUserOperation(pendingUserOperation, {
    setUserOperationFailed: args.db.setUserOperationFailed,
    wallet_handleUserOperation: args.rpcs.wallet_handleUserOperation,
    Server: args.Err.Server,
  })

  return {
    userOpHash: pendingUserOperation.userOpHash,
  }
}
