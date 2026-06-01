import {map, dbid, oneOrMore} from '@fluent-wallet/spec'
import {
  EIP7702_DELEGATION_PREFIX,
  EIP7702_NETWORK_CONFIGS,
} from '@fluent-wallet/consts'

export const NAME = 'wallet_getEip7702AccountStates'

const EIP7702_DELEGATION_CODE_LENGTH = EIP7702_DELEGATION_PREFIX.length + 40

export const schemas = {
  input: [
    oneOrMore,
    [map, {closed: true}, ['accountId', dbid], ['networkId', dbid]],
  ],
}

export const permissions = {
  external: ['popup'],
  locked: true,
  methods: ['eth_getCode'],
  db: ['getAccountById', 'getNetworkById', 'accountAddrByNetwork'],
}

function parseEip7702AccountCode(accountCodeHex, configuredDelegateAddress) {
  if (!accountCodeHex || accountCodeHex === '0x') {
    return {
      state: 'notDelegated',
      delegatedAddress: null,
    }
  }

  const lowerCaseAccountCodeHex = accountCodeHex.toLowerCase()
  const lowerCaseConfiguredDelegateAddress =
    configuredDelegateAddress.toLowerCase()

  if (
    !lowerCaseAccountCodeHex.startsWith(EIP7702_DELEGATION_PREFIX) ||
    lowerCaseAccountCodeHex.length !== EIP7702_DELEGATION_CODE_LENGTH
  ) {
    return {
      state: 'unsupportedCode',
      delegatedAddress: null,
    }
  }

  const delegatedAddress = `0x${lowerCaseAccountCodeHex.slice(
    EIP7702_DELEGATION_PREFIX.length,
  )}`

  if (delegatedAddress === lowerCaseConfiguredDelegateAddress) {
    return {
      state: 'delegatedToConfigured',
      delegatedAddress,
    }
  }

  return {
    state: 'delegatedToOther',
    delegatedAddress,
  }
}

export const main = async ({
  Err: {InvalidParams},
  db: {getAccountById, getNetworkById, accountAddrByNetwork},
  rpcs: {eth_getCode},
  params: accountStateQueries,
}) => {
  const accountStates = await Promise.all(
    accountStateQueries.map(async ({accountId, networkId}) => {
      const account = getAccountById(accountId)
      if (!account) throw InvalidParams(`Invalid account id ${accountId}`)

      const network = getNetworkById(networkId)
      if (!network) throw InvalidParams(`Invalid network id ${networkId}`)

      const targetNetworkAddressRecord = accountAddrByNetwork({
        account: accountId,
        network: networkId,
      })
      const targetNetworkAccountAddress = targetNetworkAddressRecord?.value

      if (!targetNetworkAccountAddress) {
        throw InvalidParams(
          `Account ${accountId} has no address on network ${networkId}`,
        )
      }

      const configuredDelegateAddress =
        EIP7702_NETWORK_CONFIGS[network.chainId]?.delegateAddress || null

      if (!configuredDelegateAddress) {
        return {
          accountId,
          networkId,
          state: 'unsupportedNetwork',
          accountAddress: targetNetworkAccountAddress,
          chainId: network.chainId,
          code: null,
          delegatedAddress: null,
          configuredDelegateAddress: null,
        }
      }

      const accountCodeHex = await eth_getCode({networkName: network.name}, [
        targetNetworkAccountAddress,
        'latest',
      ])

      return {
        accountId,
        networkId,
        ...parseEip7702AccountCode(accountCodeHex, configuredDelegateAddress),
        accountAddress: targetNetworkAccountAddress,
        chainId: network.chainId,
        code: accountCodeHex,
        configuredDelegateAddress,
      }
    }),
  )

  return accountStates
}
