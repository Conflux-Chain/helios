import {dbid, map} from '@fluent-wallet/spec'
import {TOKEN_PAY_NETWORK_CONFIGS} from '@fluent-wallet/consts'

export const NAME = 'wallet_getTokenPayConfig'

export const schemas = {
  input: [map, {closed: true}, ['networkDbId', dbid]],
}

export const permissions = {
  external: ['popup'],
  locked: true,
  methods: ['wallet_validate20Token'],
  db: ['getNetworkById'],
}

function createUnavailableResult(reason) {
  return {
    available: false,
    reason,
    recipient: null,
    tokens: [],
    minGasFeeRatio: null,
    minGasTipRatio: null,
    maxGasCost: null,
    suggestedGasPriceBumpRatio: null,
    suggestedTokenPriceBumpRatio: null,
  }
}

async function fetchTokenPayConfig(backendBaseUrl) {
  const response = await fetch(`${backendBaseUrl}/tokenpay/config`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
  })

  if (!response.ok) {
    throw new Error('Failed to fetch token-pay config')
  }

  const result = await response.json()

  if (result.code !== 0) {
    throw new Error('Failed to fetch token-pay config')
  }

  return result.data
}

export const main = async ({
  Err: {InvalidParams},
  db: {getNetworkById},
  rpcs: {wallet_validate20Token},
  params: {networkDbId},
}) => {
  const network = getNetworkById(networkDbId)

  if (!network) {
    throw InvalidParams(`Invalid networkDbId ${networkDbId}`)
  }

  const tokenPayNetworkConfig = TOKEN_PAY_NETWORK_CONFIGS[network.chainId]

  if (!tokenPayNetworkConfig) {
    return createUnavailableResult('unsupportedNetwork')
  }

  let backendConfig
  try {
    backendConfig = await fetchTokenPayConfig(
      tokenPayNetworkConfig.backendBaseUrl,
    )
  } catch {
    return createUnavailableResult('backendFetchFailed')
  }

  const tokens = (
    await Promise.all(
      backendConfig.tokens.map(async tokenAddress => {
        const tokenMetadata = await wallet_validate20Token({tokenAddress})

        if (!tokenMetadata?.valid) return null

        return {
          address: tokenAddress.toLowerCase(),
          name: tokenMetadata.name,
          symbol: tokenMetadata.symbol,
          decimals: tokenMetadata.decimals,
        }
      }),
    )
  ).filter(Boolean)

  if (tokens.length === 0) {
    return createUnavailableResult('noValidTokens')
  }

  return {
    available: true,
    reason: null,
    recipient: backendConfig.recipient,
    tokens,
    minGasFeeRatio: backendConfig.minGasFeeRatio,
    minGasTipRatio: backendConfig.minGasTipRatio,
    maxGasCost: backendConfig.maxGasCost,
    suggestedGasPriceBumpRatio: backendConfig.suggestedGasPriceBumpRatio,
    suggestedTokenPriceBumpRatio: backendConfig.suggestedTokenPriceBumpRatio,
  }
}
