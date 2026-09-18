import {createBackendClient} from '@fluent-wallet/backend-client'
import {EIP7702_NETWORK_CONFIGS} from '@fluent-wallet/consts'
import {getEip7702DelegateAddressFromCode} from '@fluent-wallet/detect-address-type'
import {map, dbid, oneOrMore} from '@fluent-wallet/spec'

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

function parseEip7702AccountCode(accountCodeHex, supportedDelegateAddresses) {
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

  return {
    state: supportedDelegateAddresses.includes(delegatedAddress)
      ? 'delegatedToConfigured'
      : 'delegatedToOther',
    delegatedAddress,
  }
}

export const main = async ({
  Err: {InvalidParams, Server},
  db: {getAccountById, getNetworkById, accountAddrByNetwork},
  rpcs: {eth_getCode},
  params: accountStateQueries,
}) =>
  Promise.all(
    accountStateQueries.map(async ({accountId, networkId}) => {
      const account = getAccountById(accountId)
      if (!account) {
        throw InvalidParams(`Invalid account id ${accountId}`)
      }

      const network = getNetworkById(networkId)
      if (!network) {
        throw InvalidParams(`Invalid network id ${networkId}`)
      }

      const accountAddress = accountAddrByNetwork({
        account: accountId,
        network: networkId,
      })?.value

      if (!accountAddress) {
        throw InvalidParams(
          `Account ${accountId} has no address on network ${networkId}`,
        )
      }

      const {backendBaseUrl} = EIP7702_NETWORK_CONFIGS[network.chainId] || {}

      if (!backendBaseUrl) {
        return {
          accountId,
          networkId,
          state: 'unsupportedNetwork',
          accountAddress,
          chainId: network.chainId,
          code: null,
          delegatedAddress: null,
          preferredDelegateAddress: null,
        }
      }

      const {smartAccountWhitelist} = await createBackendClient({
        baseUrl: backendBaseUrl,
      }).getPaymasterConfig()

      if (!smartAccountWhitelist?.length) {
        throw Server('No EIP-7702 delegate address is configured')
      }

      const supportedDelegateAddresses = smartAccountWhitelist.map(address =>
        address.toLowerCase(),
      )

      const preferredDelegateAddress = supportedDelegateAddresses[0]

      const accountCodeHex = await eth_getCode({networkName: network.name}, [
        accountAddress,
        'latest',
      ])

      return {
        accountId,
        networkId,
        ...parseEip7702AccountCode(accountCodeHex, supportedDelegateAddresses),
        accountAddress,
        chainId: network.chainId,
        code: accountCodeHex,
        preferredDelegateAddress,
      }
    }),
  )
