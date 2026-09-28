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
  db: ['findAddress', 'findAccount', 'getOneNetwork', 'accountAddrByNetwork'],
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
  address,
  chainId,
  getOneNetwork,
  accountAddrByNetwork,
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

  const accountAddress = accountAddrByNetwork({
    account: accountId,
    network: network.eid,
  })?.value

  if (accountAddress?.toLowerCase() !== address.toLowerCase()) {
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
  db: {findAddress, findAccount, getOneNetwork, accountAddrByNetwork},
  rpcs: {wallet_getEip7702AccountStates},
  params: [address, requestedChainIds],
  app,
}) => {
  const authorizedAccount = app?.account?.find(({eid}) => {
    const addresses = findAddress({
      accountId: eid,
      networkType: 'eth',
      value: address,
    })

    return addresses.length > 0
  })

  if (!authorizedAccount) {
    throw Unauthorized()
  }

  const account = findAccount({
    accountId: authorizedAccount.eid,
    g: {
      eid: 1,
      _accountGroup: {
        vault: {
          type: 1,
        },
      },
    },
  })

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
        address,
        chainId,
        getOneNetwork,
        accountAddrByNetwork,
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
