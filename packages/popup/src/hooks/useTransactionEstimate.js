import useSWR from 'swr'
import {useRPCProvider} from '@fluent-wallet/use-rpc'
import {ETH_TX_TYPES} from '@fluent-wallet/consts'
import {
  cfxEstimateGasAndCollateral,
  ethEstimateGas,
  cfxGetFeeDataWithSponsorship,
  ethGetFeeData,
} from '@fluent-wallet/estimate-tx'
import {useBalance} from './useApi'
import {useGasFeeSuggestions} from './useGasFeeSuggestions'
import {applyTxOptions} from '../utils/gas'

export function useTransactionEstimate({
  transaction,
  txOptions,
  feeSuggestions: providedFeeSuggestions,
  uses1559Fees,
  network,
  tokensAmount = {},
  valueForBalance,
}) {
  const {provider} = useRPCProvider()

  // Use the caller's quote or fetch fee suggestions.
  const feeSuggestionsResult = useGasFeeSuggestions({
    network: providedFeeSuggestions ? null : network,
    uses1559Fees,
  })
  const feeSuggestions = providedFeeSuggestions ?? feeSuggestionsResult.data

  // Prepare the current choices before the Gas/Storage estimate is available.
  const txWithOptions = applyTxOptions({
    tx: transaction,
    txOptions,
    feeSuggestions,
    uses1559Fees,
  })

  const enabled = Boolean(
    network?.name &&
      network.chainId &&
      (network.type === 'cfx' || network.type === 'eth') &&
      txWithOptions.from &&
      (txWithOptions.to || txWithOptions.data),
  )

  const hasGasPrices =
    typeof uses1559Fees === 'boolean' &&
    Boolean(
      uses1559Fees
        ? txWithOptions.maxFeePerGas && txWithOptions.maxPriorityFeePerGas
        : txWithOptions.gasPrice,
    )

  // Read balances for the fee and transfer checks.
  const balanceData = useBalance(
    enabled ? txWithOptions.from : null,
    network?.eid,
    ['0x0', ...Object.keys(tokensAmount)],
  )

  const balances = balanceData?.[txWithOptions.from?.toLowerCase()]
  const nativeBalance = balances?.['0x0']

  // Wait for prices and balance before estimating the current transaction.
  const {
    data,
    error: estimateError,
    isValidating,
  } = useSWR(
    enabled && hasGasPrices && provider && nativeBalance !== undefined
      ? [
          'transactionEstimate',
          network.eid,
          network.name,
          network.type,
          network.chainId,
          transaction,
          txOptions,
          txWithOptions,
          uses1559Fees,
          tokensAmount,
          valueForBalance,
          balances,
        ]
      : null,
    () =>
      estimateTransaction({
        transaction,
        txOptions,
        txWithOptions,
        feeSuggestions,
        uses1559Fees,
        network,
        tokensAmount,
        valueForBalance,
        balances,
        request: rpcRequest =>
          provider.request({
            ...rpcRequest,
            networkName: network.name,
          }),
      }),
    {
      revalidateOnMount: true,
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      onError: () => {},
    },
  )

  // Recommendation errors only block transactions with missing prices.
  const error = hasGasPrices ? estimateError : feeSuggestionsResult.error
  const loading = enabled && !error && (!hasGasPrices || !data || isValidating)

  // Only expose a completed estimate for the current inputs.
  return {
    data: enabled && !loading && !error ? data : undefined,
    loading,
    error: enabled ? error : undefined,
    feeSuggestions,
    txWithOptions,
    hasGasPrices,
  }
}

// Estimate limits, select transaction parameters, and calculate costs.
async function estimateTransaction({
  transaction,
  txOptions,
  txWithOptions,
  feeSuggestions,
  uses1559Fees,
  network,
  tokensAmount,
  valueForBalance,
  balances,
  request,
}) {
  const nativeBalance = balances['0x0']
  const isCfx = network.type === 'cfx'
  const {from, to} = txWithOptions
  const hasExplicitNonce = txWithOptions.nonce !== undefined

  // Get the nonce for simulation and the recipient type.
  const [nonce, addressInfo] = await Promise.all([
    hasExplicitNonce
      ? txWithOptions.nonce
      : request({
          method: isCfx ? 'cfx_getNextUsableNonce' : 'eth_getTransactionCount',
          params: isCfx ? [from] : [from, 'pending'],
        }),
    to
      ? request({
          method: 'wallet_detectAddressType',
          params: {address: to},
        })
      : undefined,
  ])

  const toAddressType = addressInfo?.type
  // An automatic nonce is only used for simulation.
  const simulationTx = {...txWithOptions, nonce}

  const isEip7702Tx =
    simulationTx.type === ETH_TX_TYPES.EIP7702 ||
    !!simulationTx.authorizationList

  // Plain transfers use 21,000 Gas and no Core storage collateral.
  const isPlainTransfer =
    to &&
    (!simulationTx.data || simulationTx.data === '0x') &&
    !isEip7702Tx &&
    !simulationTx.accessList?.length &&
    (isCfx ? toAddressType === 'user' : toAddressType !== 'contract')

  // Estimate Gas and, on Core, storage collateral.
  let limitEstimate

  if (isPlainTransfer) {
    limitEstimate = {
      gasUsed: '0x5208',
      gasLimit: '0x5208',
      estimatedGasLimit: '0x5208',
      nonce,
      ...(isCfx
        ? {
            storageCollateralized: '0x0',
            estimatedStorageLimit: '0x0',
          }
        : {}),
    }
  } else if (isCfx) {
    limitEstimate = await cfxEstimateGasAndCollateral(simulationTx, {
      request,
      retryOnNonceTooOld: !hasExplicitNonce,
    })
  } else {
    limitEstimate = await ethEstimateGas(simulationTx, {
      request,
      chainId: network.chainId,
      retryOnNonceTooOld: !hasExplicitNonce,
    })
  }

  // Apply the estimate to the original transaction and user choices.
  const selectedTransaction = applyTxOptions({
    tx: transaction,
    txOptions,
    feeSuggestions,
    limitEstimate,
    uses1559Fees,
  })

  // Calculate the sender's cost using the selected limits and prices.
  const feePerGas = uses1559Fees
    ? selectedTransaction.maxFeePerGas
    : selectedTransaction.gasPrice

  // Batch calls may spend more than the outer transaction's value.
  const balanceValue = valueForBalance ?? selectedTransaction.value

  const tokensBalance = Object.fromEntries(
    Object.keys(tokensAmount).map(address => [
      address,
      balances[address.toLowerCase()],
    ]),
  )

  let feeData

  if (isCfx) {
    feeData = await cfxGetFeeDataWithSponsorship(
      {
        from: selectedTransaction.from,
        to: selectedTransaction.to,
        gas: selectedTransaction.gas,
        feePerGas,
        storageLimit: selectedTransaction.storageLimit,
        value: balanceValue,
        tokensAmount,
      },
      {
        request,
        toAddressType,
        balance: nativeBalance,
        tokensBalance,
      },
    )
  } else {
    feeData = ethGetFeeData(
      {
        gas: selectedTransaction.gas,
        gasPrice: feePerGas,
        value: balanceValue,
        tokensAmount,
      },
      {
        balance: nativeBalance,
        tokensBalance,
      },
    )
  }

  // Keep the selected transaction and its fee and balance data together.
  return {
    ...limitEstimate,
    ...feeData,
    gasLimit: selectedTransaction.gas,
    gasPrice: selectedTransaction.gasPrice,
    maxFeePerGas: selectedTransaction.maxFeePerGas,
    maxPriorityFeePerGas: selectedTransaction.maxPriorityFeePerGas,
    transaction: selectedTransaction,
  }
}
