import {EIP7702_NETWORK_CONFIGS} from '@fluent-wallet/consts'
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
import {
  decodeGetNonceResult,
  encodeGetNonceCall,
} from '@fluent-wallet/user-operation'

export const NAME = 'wallet_getSponsorship'

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
    'eth_call',
    'eth_getTransactionCount',
    'wallet_getEip7702AccountStates',
    'wallet_prepareSponsoredUserOperation',
    'wallet_getEthereumNonceState',
  ],
  db: ['findAccount', 'getNetworkById', 'getOccupiedUserOperationNonces'],
}

function unsupportedResult(reason) {
  return {
    supported: false,
    available: false,
    reason,
    maxGasCost: null,
    requiredDelegationAction: null,
  }
}

export const main = async ({
  Err: {InvalidParams},
  db: {findAccount, getNetworkById, getOccupiedUserOperationNonces},
  rpcs: {
    eth_call,
    eth_getTransactionCount,
    wallet_getEip7702AccountStates,
    wallet_prepareSponsoredUserOperation,
    wallet_getEthereumNonceState,
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

  if (!networkConfig.whitelistPaymasterAddress) {
    return unsupportedResult('sponsorshipNotConfigured')
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
  const {entryPointAddress, delegateAddress} = networkConfig

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
      }
    }

    authorization = {
      chainId: network.chainId,
      address: delegateAddress,
      nonce: networkLatestNonce,
    }
  }

  const encodedNonce = await eth_call(
    {
      errorFallThrough: true,
      network,
    },
    [
      {
        to: entryPointAddress,
        data: encodeGetNonceCall(sender),
      },
      'latest',
    ],
  )

  const networkUserOperationNonce = decodeGetNonceResult(encodedNonce)
  const occupiedUserOperationNonces = getOccupiedUserOperationNonces({
    sender,
    chainId: network.chainId,
    entryPoint: entryPointAddress,
  })

  const [nonce] = resolveTransactionNonces({
    networkPendingNonce: networkUserOperationNonce,
    occupiedNonces: occupiedUserOperationNonces,
  })

  const prepared = await wallet_prepareSponsoredUserOperation(
    {
      errorFallThrough: true,
      network,
    },
    {
      sender,
      nonce,
      calls,
      ...(authorization ? {authorization} : {}),
    },
  )

  return {
    supported: true,
    available: prepared.sponsorship.sponsorable,
    reason: prepared.sponsorship.reason,
    maxGasCost: prepared.maxGasCost,
    requiredDelegationAction,
  }
}
