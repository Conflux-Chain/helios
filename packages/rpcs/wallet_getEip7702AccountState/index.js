import {map, dbid, oneOrMore} from '@fluent-wallet/spec'
import {EIP7702_NETWORK_CONFIGS} from '@fluent-wallet/consts'
import {getEip7702DelegateAddressFromCode} from '@fluent-wallet/detect-address-type'

export const NAME = 'wallet_getEip7702AccountStates'

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

  const delegatedAddress = getEip7702DelegateAddressFromCode(accountCodeHex)

  if (!delegatedAddress) {
    return {
      state: 'unsupportedCode',
      delegatedAddress: null,
    }
  }

  if (delegatedAddress === configuredDelegateAddress.toLowerCase()) {
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
