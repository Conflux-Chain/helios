import * as spec from '@fluent-wallet/spec'
import genEthTxSchema from '@fluent-wallet/eth-transaction-schema'
import {
  calcTokenAmountFromNativeAmount,
  fetchTokenPayPrice,
  prepareTokenPayBaseContext,
} from '@fluent-wallet/wallet_prepare-token-pay-quote'

const {map, dbid, or, hex} = spec

const {Transaction1559Unsigned, Transaction7702Unsigned} = genEthTxSchema(spec)

export const NAME = 'wallet_getTokenPayGasOptions'

export const txSchema = [or, Transaction1559Unsigned, Transaction7702Unsigned]

export const schemas = {
  input: [
    map,
    {closed: true},
    ['networkDbId', dbid],
    ['accountId', dbid],
    ['userTx', txSchema],
    ['nativeGasFee', hex],
  ],
}

export const permissions = {
  external: ['popup'],
  locked: true,
  methods: ['wallet_getTokenPayConfig'],
  db: ['getAccountById', 'getNetworkById', 'accountAddrByNetwork'],
}

export const main = async ({
  Err: {InvalidParams},
  db,
  rpcs,
  params: {networkDbId, accountId, userTx, nativeGasFee},
}) => {
  const context = await prepareTokenPayBaseContext({
    InvalidParams,
    db,
    rpcs,
    params: {networkDbId, accountId, userTx},
    ignoreQuoteTokenPriceError: true,
  })
  const nativeQuoteAmount = calcTokenAmountFromNativeAmount({
    nativeAmount: nativeGasFee,
    tokenPrice: context.quoteTokenPrice,
  })

  const tokenQuotes = await Promise.all(
    context.tokenPayConfig.tokens.map(async gasToken => {
      try {
        const tokenPrice = await fetchTokenPayPrice(
          context.tokenPayNetworkConfig.backendBaseUrl,
          gasToken.address,
        )

        return [
          gasToken.address.toLowerCase(),
          {
            estimatedTokenAmount: calcTokenAmountFromNativeAmount({
              nativeAmount: nativeGasFee,
              tokenPrice,
            }),
            estimatedQuoteAmount: nativeQuoteAmount,
            tokenPrice,
          },
        ]
      } catch (err) {
        return null
      }
    }),
  )

  return {
    quoteToken: context.quoteToken,
    quoteTokenPrice: context.quoteTokenPrice,
    native: {
      estimatedTokenAmount: nativeGasFee,
      estimatedQuoteAmount: nativeQuoteAmount,
    },
    tokens: tokenQuotes.reduce((acc, item) => {
      if (!item) return acc

      const [address, quote] = item
      acc[address] = {
        estimatedTokenAmount: quote.estimatedTokenAmount,
        estimatedQuoteAmount: quote.estimatedQuoteAmount,
        tokenPrice: quote.tokenPrice,
      }
      return acc
    }, {}),
  }
}
