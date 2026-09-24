import {
  CFX_ESPACE_MAINNET_CHAINID,
  CFX_ESPACE_TESTNET_CHAINID,
  EIP7702_NETWORK_CONFIGS,
} from '@fluent-wallet/consts'
import {getAtomicCapability} from '@fluent-wallet/eip-5792'
import {arr, cat, Quantity, re, zeroOrOne} from '@fluent-wallet/spec'

export const NAME = 'wallet_getCapabilities'

const ESPACE_CHAIN_IDS = [
  CFX_ESPACE_MAINNET_CHAINID,
  CFX_ESPACE_TESTNET_CHAINID,
]

const paramsSchema = [
  cat,
  [re, /^0x[0-9a-fA-F]{40}$/],
  [zeroOrOne, [arr, Quantity]],
]

export const schemas = {
  input: paramsSchema,
}

export const permissions = {
  external: ['inpage'],
  locked: true,
  methods: ['wallet_getEip7702AccountStates'],
  db: ['findAddress', 'getOneNetwork'],
}

function getESpaceChainIds(requestedChainIds) {
  const chainIds = requestedChainIds?.length
    ? requestedChainIds
    : ESPACE_CHAIN_IDS

  return [...new Set(chainIds.map(chainId => chainId.toLowerCase()))].filter(
    chainId => ESPACE_CHAIN_IDS.includes(chainId),
  )
}

async function getAtomicStatus({
  accountId,
  chainId,
  getOneNetwork,
  wallet_getEip7702AccountStates,
}) {
  const networkConfig = EIP7702_NETWORK_CONFIGS[chainId]
  const network = getOneNetwork({
    type: 'eth',
    chainId,
  })

  if (!networkConfig || !network) {
    return null
  }

  let accountStates

  try {
    accountStates = await wallet_getEip7702AccountStates(
      {
        errorFallThrough: true,
        network,
        networkName: network.name,
      },
      [
        {
          accountId,
          networkId: network.eid,
        },
      ],
    )
  } catch {
    return null
  }

  const accountState = accountStates?.[0]

  if (!accountState) {
    return null
  }

  const atomicCapability = getAtomicCapability({
    isChainEnabled: true,
    isAccountSupported: true,
    delegationState: accountState.state,
    canSwitchDelegation: networkConfig.canSwitchDelegation,
  })

  return atomicCapability?.status || null
}

export const main = async ({
  Err: {Unauthorized},
  db: {findAddress, getOneNetwork},
  rpcs: {wallet_getEip7702AccountStates},
  params: [address, requestedChainIds],
  app,
}) => {
  if (!app) {
    throw Unauthorized()
  }

  const addressRecord = findAddress({
    appId: app.eid,
    value: address,
    accountG: {
      eid: 1,
      _accountGroup: {
        vault: {
          type: 1,
        },
      },
    },
  })

  if (!addressRecord?.account) {
    throw Unauthorized()
  }

  const account = addressRecord.account
  const vaultType = account.accountGroup.vault.type
  const isSoftwareAccount = vaultType === 'hd' || vaultType === 'pk'

  if (!isSoftwareAccount) {
    return {}
  }

  const chainIds = getESpaceChainIds(requestedChainIds)

  const atomicStatuses = await Promise.all(
    chainIds.map(async chainId => ({
      chainId,
      status: await getAtomicStatus({
        accountId: account.eid,
        chainId,
        getOneNetwork,
        wallet_getEip7702AccountStates,
      }),
    })),
  )

  const capabilities = {}

  for (const {chainId, status} of atomicStatuses) {
    if (status) {
      capabilities[chainId] = {
        atomic: {
          status,
        },
      }
    }
  }

  return capabilities
}
