import {EIP7702_NETWORK_CONFIGS, NULL_HEX_ADDRESS} from '@fluent-wallet/consts'
import {
  createBackendClient,
  BackendServiceError,
} from '@fluent-wallet/backend-client'
import {
  hasEip7702AuthorizationNonceConflict,
  resolveTransactionNonces,
} from '@fluent-wallet/nonce-manager'
import {
  Bytes,
  Uint,
  dbid,
  ethHexAddress,
  map,
  oneOrMore,
} from '@fluent-wallet/spec'

export const NAME = 'wallet_prepareSponsorship'

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
  external: ['popup'],
  methods: [
    'eth_getTransactionCount',
    'wallet_getEip7702AccountStates',
    'wallet_getEthereumNonceState',
    'wallet_getUserOperationNonceState',
    'wallet_prepareUserOperation',
  ],
  db: ['findAccount', 'getNetworkById'],
}

const PAYMASTER_ERROR_REASONS = {
  1: 'invalidRequest',
  3: 'rateLimited',
  4001: 'maxGasCostExceeded',
  4002: 'smartAccountNotWhitelisted',
  4003: 'contractNotWhitelisted',
  4004: 'paymasterPaused',
  4005: 'tooManyPendingUserOperations',
}

function getPaymasterErrorReason(error) {
  if (!(error instanceof BackendServiceError)) {
    return 'backendUnavailable'
  }

  return PAYMASTER_ERROR_REASONS[error.code] || 'backendUnavailable'
}

function unavailableResult(reason, requiredDelegationAction = null) {
  return {
    supported: true,
    available: false,
    reason,
    maxGasCost: null,
    requiredDelegationAction,
    sponsorship: null,
  }
}
function unsupportedResult(reason) {
  return {
    supported: false,
    available: false,
    reason,
    maxGasCost: null,
    requiredDelegationAction: null,
    sponsorship: null,
  }
}

export const main = async ({
  Err: {InvalidParams},
  db: {findAccount, getNetworkById},
  rpcs: {
    eth_getTransactionCount,
    wallet_getEip7702AccountStates,
    wallet_getEthereumNonceState,
    wallet_getUserOperationNonceState,
    wallet_prepareUserOperation,
  },
  params: {accountId, networkId, calls},
}) => {
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

  const networkConfig = EIP7702_NETWORK_CONFIGS[network.chainId]
  if (!networkConfig) {
    return unsupportedResult('unsupportedNetwork')
  }

  const vaultType = account.accountGroup.vault.type
  if (vaultType !== 'hd' && vaultType !== 'pk') {
    return unsupportedResult('unsupportedAccount')
  }

  const [accountState] = await wallet_getEip7702AccountStates(
    {
      errorFallThrough: true,
      network,
      networkName: network.name,
    },
    [{accountId, networkId}],
  )

  let requiredDelegationAction = null

  switch (accountState.state) {
    case 'notDelegated':
      requiredDelegationAction = 'upgrade'
      break
    case 'delegatedToOther':
      requiredDelegationAction = 'switch'
      break
    case 'delegatedToConfigured':
      break
    default:
      return unsupportedResult(accountState.state)
  }

  const sender = accountState.accountAddress.toLowerCase()
  const {backendBaseUrl, delegateAddress} = networkConfig

  if (!backendBaseUrl) {
    return unsupportedResult('sponsorshipNotConfigured')
  }
  let authorization

  if (requiredDelegationAction) {
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

    if (
      hasEip7702AuthorizationNonceConflict({
        networkLatestNonce,
        networkPendingNonce,
        occupiedNonces,
      })
    ) {
      return {
        supported: true,
        available: false,
        reason: 'pendingTransaction',
        maxGasCost: null,
        requiredDelegationAction: null,
        sponsorship: null,
      }
    }

    authorization = {
      chainId: network.chainId,
      address: delegateAddress,
      nonce: networkLatestNonce,
    }
  }

  const {networkPendingNonce, occupiedNonces} =
    await wallet_getUserOperationNonceState({errorFallThrough: true, network}, [
      sender,
    ])

  const [nonce] = resolveTransactionNonces({
    networkPendingNonce,
    occupiedNonces,
  })

  const backendClient = createBackendClient({
    baseUrl: backendBaseUrl,
  })

  let paymasterStub

  try {
    paymasterStub = await backendClient.getPaymasterStub()
  } catch (error) {
    return unavailableResult(getPaymasterErrorReason(error))
  }

  const prepared = await wallet_prepareUserOperation(
    {
      errorFallThrough: true,
      network,
    },
    {
      sender,
      nonce,
      calls,
      paymaster: paymasterStub.address,
      paymasterData: paymasterStub.data,
      ...(authorization ? {authorization} : {}),
    },
  )

  const {authorization: preparedAuthorization, ...paymasterUserOperation} =
    prepared.userOperation

  let signedPaymasterData

  try {
    signedPaymasterData = await backendClient.signPaymasterUserOperation({
      ...paymasterUserOperation,
      delegatedContract: preparedAuthorization?.address ?? NULL_HEX_ADDRESS,
    })
  } catch (error) {
    return unavailableResult(
      getPaymasterErrorReason(error),
      requiredDelegationAction,
    )
  }

  return {
    supported: true,
    available: true,
    reason: null,
    maxGasCost: prepared.maxGasCost,
    requiredDelegationAction,
    sponsorship: {
      userOperation: {
        ...prepared.userOperation,
        paymasterData: signedPaymasterData,
      },
    },
  }
}
