import * as spec from '@fluent-wallet/spec'
import genEthTxSchema from '@fluent-wallet/eth-transaction-schema'
import {
  prepareGasTokenQuote,
  prepareTokenPayExecutionContext,
  resolveTokenPayNonces,
} from './utils.js'

export {
  calcTokenAmountFromNativeAmount,
  getTokenPayGasCostPrice,
  prepareGasTokenQuote,
  prepareTokenPayBaseContext,
  prepareTokenPayExecutionContext,
  resolveTokenPayNonces,
} from './utils.js'

const {map, dbid, enums, or, ethHexAddress} = spec

const {
  TransactionLegacyUnsigned,
  Transaction1559Unsigned,
  Transaction7702Unsigned,
} = genEthTxSchema(spec)

export const NAME = 'wallet_prepareTokenPayQuote'

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
    ['gasTokenAddress', ethHexAddress],
    ['gasLevel', [enums, 'low', 'medium', 'high']],
  ],
}

export const permissions = {
  external: ['popup'],
  locked: true,
  methods: [
    'wallet_getTokenPayConfig',
    'eth_getTransactionCount',
    'eth_gasPrice',
    'eth_estimateGas',
    'wallet_network1559Compatible',
  ],
  db: ['getAccountById', 'getNetworkById', 'accountAddrByNetwork'],
}

export const main = async ({
  Err: {InvalidParams},
  db,
  rpcs,
  params: {networkDbId, accountId, userTx, gasTokenAddress, gasLevel},
}) => {
  const {
    network,
    accountAddress,
    tokenPayConfig,
    backendClient,
    txType,
    nonceBase,
    feeParams,
    quoteToken,
    quoteTokenPrice,
    estimateStateOverride,
  } = await prepareTokenPayExecutionContext({
    InvalidParams,
    db,
    rpcs,
    params: {networkDbId, accountId, userTx, gasLevel},
  })
  const gasToken = tokenPayConfig.tokens.find(
    token => token.address.toLowerCase() === gasTokenAddress.toLowerCase(),
  )

  if (!gasToken) {
    throw InvalidParams(`Unsupported gas token ${gasTokenAddress}`)
  }

  const tokenPrice = await backendClient.getTokenPayPrice(gasToken.address)
  const bundleNonces = resolveTokenPayNonces({
    networkPendingNonce: nonceBase,
    userTx,
  })

  const gasTokenQuote = await prepareGasTokenQuote({
    eth_estimateGas: rpcs.eth_estimateGas,
    network,
    accountAddress,
    userTx,
    gasToken,
    tokenPayConfig,
    bundleNonces,
    feeParams,
    gasLevel,
    txType,
    tokenPrice,
    quoteToken,
    quoteTokenPrice,
    estimateStateOverride,
    InvalidParams,
    includeTxs: true,
  })

  return {
    gasLevel,
    recipient: tokenPayConfig.recipient,
    gasToken: gasTokenQuote.gasToken,
    tokenPrice: gasTokenQuote.tokenPrice,
    quoteToken: gasTokenQuote.quoteToken,
    quoteTokenPrice: gasTokenQuote.quoteTokenPrice,
    quoteAmount: gasTokenQuote.quoteAmount,
    nonceBase,
    feeParams,
    fundingGasLimit: gasTokenQuote.fundingGasLimit,
    gasCost: gasTokenQuote.gasCost,
    tokenCost: gasTokenQuote.tokenCost,
    transferTokenTx: gasTokenQuote.transferTokenTx,
    preparedUserTx: gasTokenQuote.preparedUserTx,
  }
}
