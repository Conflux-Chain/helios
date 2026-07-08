import * as spec from '@fluent-wallet/spec'
import genEthTxSchema from '@fluent-wallet/eth-transaction-schema'
import {
  calcTokenAmountFromNativeAmount,
  fetchTokenPayPrice,
  getTokenPayGasCostPrice,
  prepareGasTokenQuote,
  prepareTokenPayExecutionContext,
} from '@fluent-wallet/wallet_prepare-token-pay-quote'
import {hexToBN, toHexQuantity} from '@fluent-wallet/utils'

const {map, dbid, or, hex, enums} = spec

const {
  TransactionLegacyUnsigned,
  Transaction1559Unsigned,
  Transaction7702Unsigned,
} = genEthTxSchema(spec)

export const NAME = 'wallet_getTokenPayGasOptions'

export const txSchema = [
  or,
  TransactionLegacyUnsigned,
  Transaction1559Unsigned,
  Transaction7702Unsigned,
]

export const schemas = {
  input: [
    map,
    {closed: true},
    ['networkDbId', dbid],
    ['accountId', dbid],
    ['userTx', txSchema],
    ['nativeGasFee', hex],
    ['gasLevel', [enums, 'low', 'medium', 'high']],
  ],
}

export const permissions = {
  external: ['popup'],
  locked: true,
  methods: [
    'wallet_getTokenPayConfig',
    'wallet_getBalance',
    'eth_getTransactionCount',
    'eth_gasPrice',
    'eth_estimateGas',
    'wallet_network1559Compatible',
  ],
  db: ['getAccountById', 'getNetworkById', 'accountAddrByNetwork'],
}

function calcUserTxNativeGasLowerBound({userGas, gasPrice}) {
  return toHexQuantity(hexToBN(userGas).mul(hexToBN(gasPrice)))
}

function createEstimateGasForOptions(eth_estimateGas) {
  // Keep quote failures scoped to the current gas token option.
  return (overrides, params) =>
    eth_estimateGas({...overrides, errorFallThrough: true}, params)
}

function unavailableOption({tokenPrice = '', reason}) {
  return {
    estimatedTokenAmount: '',
    estimatedQuoteAmount: '',
    tokenPrice,
    available: false,
    unavailableReason: reason,
  }
}

async function getGasTokenBalances({
  wallet_getBalance,
  network,
  accountAddress,
  tokens,
}) {
  if (!tokens.length) return null

  try {
    const balanceData = await wallet_getBalance(
      {networkName: network.name, errorFallThrough: true},
      {
        users: [accountAddress],
        tokens: tokens.map(token => token.address),
      },
    )

    return balanceData?.[accountAddress.toLowerCase()] || null
  } catch (err) {
    return null
  }
}

export const main = async ({
  Err: {InvalidParams},
  db,
  rpcs,
  params: {networkDbId, accountId, userTx, nativeGasFee, gasLevel},
}) => {
  const context = await prepareTokenPayExecutionContext({
    InvalidParams,
    db,
    rpcs,
    params: {networkDbId, accountId, userTx, gasLevel},
  })

  const nativeQuoteAmount = calcTokenAmountFromNativeAmount({
    nativeAmount: nativeGasFee,
    tokenPrice: context.quoteTokenPrice,
  })

  const tokenBalances = await getGasTokenBalances({
    wallet_getBalance: rpcs.wallet_getBalance,
    network: context.network,
    accountAddress: context.accountAddress,
    tokens: context.tokenPayConfig.tokens,
  })

  const gasCostPrice = getTokenPayGasCostPrice({
    txType: context.txType,
    feeParams: context.feeParams,
  })
  const nativeGasLowerBound = calcUserTxNativeGasLowerBound({
    userGas: userTx.gas,
    gasPrice: gasCostPrice,
  })
  const estimateGasForOptions = createEstimateGasForOptions(
    rpcs.eth_estimateGas,
  )

  const tokenQuotes = await Promise.all(
    context.tokenPayConfig.tokens.map(async gasToken => {
      const tokenAddress = gasToken.address.toLowerCase()
      const tokenBalance = tokenBalances?.[tokenAddress]
      const hasTokenBalance = tokenBalance !== undefined

      // A zero balance cannot pay token gas, so skip the expensive quote estimate.
      if (hasTokenBalance && hexToBN(tokenBalance).isZero()) {
        return [
          tokenAddress,
          unavailableOption({reason: 'insufficientBalance'}),
        ]
      }

      let tokenPrice = ''

      try {
        tokenPrice = await fetchTokenPayPrice(
          context.tokenPayNetworkConfig.backendBaseUrl,
          gasToken.address,
        )

        const tokenLowerBound = calcTokenAmountFromNativeAmount({
          nativeAmount: nativeGasLowerBound,
          tokenPrice,
        })

        // If the balance cannot cover even the lower bound, exact quote estimation would fail later.
        if (
          hasTokenBalance &&
          tokenLowerBound &&
          hexToBN(tokenBalance).lt(hexToBN(tokenLowerBound))
        ) {
          return [
            tokenAddress,
            unavailableOption({
              tokenPrice,
              reason: 'insufficientBalance',
            }),
          ]
        }

        const quote = await prepareGasTokenQuote({
          eth_estimateGas: estimateGasForOptions,
          network: context.network,
          accountAddress: context.accountAddress,
          userTx,
          gasToken,
          tokenPayConfig: context.tokenPayConfig,
          nonceBase: context.nonceBase,
          feeParams: context.feeParams,
          gasLevel,
          txType: context.txType,
          tokenPrice,
          quoteToken: context.quoteToken,
          quoteTokenPrice: context.quoteTokenPrice,
          estimateStateOverride: context.estimateStateOverride,
          InvalidParams,
          includeTxs: false,
        })

        return [
          tokenAddress,
          {
            estimatedTokenAmount: quote.tokenCost,
            estimatedQuoteAmount: quote.quoteAmount,
            tokenPrice,
            available: true,
            unavailableReason: '',
          },
        ]
      } catch (err) {
        return [
          tokenAddress,
          unavailableOption({
            tokenPrice,
            reason: 'quoteFailed',
          }),
        ]
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
    tokens: tokenQuotes.reduce((acc, [address, quote]) => {
      acc[address] = quote
      return acc
    }, {}),
  }
}
