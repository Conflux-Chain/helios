import {EIP7702_NETWORK_CONFIGS} from '@fluent-wallet/consts'
import {
  EIP5792_VERSION,
  isBundleIdWithinByteLimit,
} from '@fluent-wallet/eip-5792'
import {
  and,
  boolean,
  cat,
  eq,
  ethHexAddress,
  fn as predicate,
  HexData,
  map,
  mapOf,
  oneOrMore,
  Quantity,
  string,
} from '@fluent-wallet/spec'
import {prepareCallBundleTransaction} from './prepare-call-bundle-transaction.js'

export const NAME = 'wallet_sendCalls'

// Bundle ID limits are measured in UTF-8 bytes.
const bundleIdSchema = [and, string, [predicate, isBundleIdWithinByteLimit]]

// Allow capability-specific fields.
const capabilitySchema = [map, ['optional', {optional: true}, boolean]]

const capabilitiesSchema = [mapOf, string, capabilitySchema]

const callSchema = [
  map,
  {closed: true},
  ['to', ethHexAddress],
  ['data', {optional: true}, HexData],
  ['value', {optional: true}, Quantity],
  ['capabilities', {optional: true}, capabilitiesSchema],
]

const requestSchema = [
  map,
  {closed: true},
  ['version', [eq, EIP5792_VERSION]],
  ['id', {optional: true}, bundleIdSchema],
  ['from', {optional: true}, ethHexAddress],
  ['chainId', Quantity],
  ['atomicRequired', boolean],
  ['calls', [oneOrMore, callSchema]],
  ['capabilities', {optional: true}, capabilitiesSchema],
]

export const schemas = {
  input: [cat, requestSchema],
}

export const permissions = {
  external: ['inpage'],
  methods: [
    'wallet_addPendingUserAuthRequest',
    'wallet_getEip7702AccountStates',
  ],
  db: ['findAddress', 'getCallBundleRecords'],
}

function generateBundleId() {
  return `0x${crypto.randomUUID().replaceAll('-', '')}`
}

export const main = async ({
  Err: {
    AtomicityNotSupported,
    DuplicateId,
    Server,
    Unauthorized,
    UnsupportedCapability,
    UnsupportedChainId,
  },
  db: {findAddress, getCallBundleRecords},
  rpcs: {wallet_addPendingUserAuthRequest, wallet_getEip7702AccountStates},
  params: [request],
  app,
}) => {
  if (!app) {
    throw Unauthorized()
  }

  const network = app.currentNetwork
  const chainId = request.chainId.toLowerCase()

  if (chainId !== network.chainId) {
    throw UnsupportedChainId(
      `Chain ${request.chainId} is not the current chain for this app`,
    )
  }

  const networkConfig = EIP7702_NETWORK_CONFIGS[network.chainId]

  if (network.type !== 'eth' || !networkConfig) {
    throw UnsupportedChainId(`Chain ${request.chainId} is not supported`)
  }

  const addressRecord = findAddress({
    appId: app.eid,
    value: request.from,
    g: {
      value: 1,
    },
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

  const vaultType = addressRecord.account.accountGroup.vault.type

  if (vaultType !== 'hd' && vaultType !== 'pk') {
    throw Server('wallet_sendCalls only supports software accounts')
  }

  for (const capabilities of [
    request.capabilities,
    ...request.calls.map(call => call.capabilities),
  ]) {
    for (const [name, capability] of Object.entries(capabilities ?? {})) {
      if (capability?.optional !== true) {
        throw UnsupportedCapability(`Unsupported required capability: ${name}`)
      }
    }
  }

  const from = addressRecord.value.toLowerCase()
  const calls = request.calls.map(({to, data = '0x', value = '0x0'}) => ({
    to: to.toLowerCase(),
    data: data.toLowerCase(),
    value: value.toLowerCase(),
  }))

  const bundleId = request.id ?? generateBundleId()
  if (
    getCallBundleRecords({
      appId: app.eid,
      bundleId,
    }).length > 0
  ) {
    throw DuplicateId('Duplicate bundle id')
  }

  const {transaction, requiredDelegationAction} =
    await prepareCallBundleTransaction(
      {
        from,
        calls,
        accountId: addressRecord.account.eid,
        atomicRequired: request.atomicRequired,
        network,
        networkConfig,
      },
      {
        wallet_getEip7702AccountStates,
        AtomicityNotSupported,
        Server,
      },
    )

  return await wallet_addPendingUserAuthRequest(
    {
      errorFallThrough: true,
    },
    {
      appId: app.eid,
      bundleId,
      req: {
        method: NAME,
        params: {
          version: EIP5792_VERSION,
          id: bundleId,
          from,
          chainId: network.chainId,
          atomicRequired: request.atomicRequired,
          calls,
          requiredDelegationAction,
          transaction,
        },
      },
    },
  )
}
