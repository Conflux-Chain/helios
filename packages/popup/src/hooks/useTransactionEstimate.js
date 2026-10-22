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

const SWR_OPTIONS = {
  revalidateOnMount: true,
  refreshInterval: 0,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
  onError: () => {},
}

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

  const balanceData = useBalance(
    enabled ? txWithOptions.from : null,
    network?.eid,
    ['0x0', ...Object.keys(tokensAmount)],
  )
  const balances = balanceData?.[txWithOptions.from?.toLowerCase()]
  const nativeBalance = balances?.['0x0']

  const networkKey = [
    network?.eid,
    network?.name,
    network?.type,
    network?.chainId,
  ]
  const request = rpcRequest =>
    provider.request({...rpcRequest, networkName: network.name})

  // Price and limit edits reuse the same Gas/Storage estimate.
  const txForEstimate = {...txWithOptions}
  delete txForEstimate.gas
  delete txForEstimate.storageLimit
  delete txForEstimate.gasPrice
  delete txForEstimate.maxFeePerGas
  delete txForEstimate.maxPriorityFeePerGas

  const {
    data: limitEstimate,
    error: limitError,
    isValidating: estimatingLimits,
  } = useSWR(
    enabled && hasGasPrices && provider && nativeBalance !== undefined
      ? ['transactionLimits', networkKey, network.gasBuffer, txForEstimate]
      : null,
    () =>
      estimateGasAndStorage({
        transaction: txForEstimate,
        network,
        request,
      }),
    SWR_OPTIONS,
  )

  // Apply current choices to the estimated limits.
  const selectedTransaction = applyTxOptions({
    tx: transaction,
    txOptions,
    feeSuggestions,
    limitEstimate,
    uses1559Fees,
  })

  // Recalculate costs and Core sponsorship for the selected parameters.
  const {
    data: feeData,
    error: feeError,
    isValidating: calculatingFees,
  } = useSWR(
    enabled &&
      hasGasPrices &&
      provider &&
      nativeBalance !== undefined &&
      limitEstimate &&
      !estimatingLimits &&
      !limitError
      ? [
          'transactionFees',
          networkKey,
          selectedTransaction,
          limitEstimate.toAddressType,
          uses1559Fees,
          tokensAmount,
          valueForBalance,
          balances,
        ]
      : null,
    () =>
      calculateTransactionFees({
        transaction: selectedTransaction,
        toAddressType: limitEstimate.toAddressType,
        uses1559Fees,
        network,
        tokensAmount,
        valueForBalance,
        balances,
        request,
      }),
    SWR_OPTIONS,
  )

  // Recommendation errors only block transactions with missing prices.
  const error = hasGasPrices
    ? limitError || feeError
    : feeSuggestionsResult.error
  const loading =
    enabled &&
    !error &&
    (!hasGasPrices ||
      !limitEstimate ||
      estimatingLimits ||
      !feeData ||
      calculatingFees)

  return {
    data:
      enabled && !loading && !error
        ? {
            ...limitEstimate,
            ...feeData,
            gasLimit: selectedTransaction.gas,
            gasPrice: selectedTransaction.gasPrice,
            maxFeePerGas: selectedTransaction.maxFeePerGas,
            maxPriorityFeePerGas: selectedTransaction.maxPriorityFeePerGas,
            transaction: selectedTransaction,
          }
        : undefined,
    loading,
    error: enabled ? error : undefined,
    feeSuggestions,
    txWithOptions,
    hasGasPrices,
  }
}

async function estimateGasAndStorage({transaction, network, request}) {
  const isCfx = network.type === 'cfx'
  const {from, to} = transaction
  const hasExplicitNonce = transaction.nonce !== undefined

  // Core uses an available nonce for simulation.
  const [nonce, addressInfo] = await Promise.all([
    isCfx || !hasExplicitNonce
      ? request({
          method: isCfx ? 'cfx_getNextUsableNonce' : 'eth_getTransactionCount',
          params: isCfx ? [from] : [from, 'pending'],
        })
      : transaction.nonce,
    to
      ? request({
          method: 'wallet_detectAddressType',
          params: {address: to},
        })
      : undefined,
  ])

  const toAddressType = addressInfo?.type
  // Use this nonce only for simulation.
  const simulationTx = {...transaction, nonce}
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
      retryOnNonceTooOld: true,
    })
  } else {
    limitEstimate = await ethEstimateGas(simulationTx, {
      request,
      chainId: network.chainId,
      gasBuffer: network.gasBuffer || 1,
      retryOnNonceTooOld: !hasExplicitNonce,
    })
  }

  return {...limitEstimate, toAddressType}
}

async function calculateTransactionFees({
  transaction,
  toAddressType,
  uses1559Fees,
  network,
  tokensAmount,
  valueForBalance,
  balances,
  request,
}) {
  const feePerGas = uses1559Fees
    ? transaction.maxFeePerGas
    : transaction.gasPrice

  // Batch calls may spend more than the outer transaction's value.
  const balanceValue = valueForBalance ?? transaction.value
  const tokensBalance = Object.fromEntries(
    Object.keys(tokensAmount).map(address => [
      address,
      balances[address.toLowerCase()],
    ]),
  )

  if (network.type === 'cfx') {
    return cfxGetFeeDataWithSponsorship(
      {
        from: transaction.from,
        to: transaction.to,
        gas: transaction.gas,
        feePerGas,
        storageLimit: transaction.storageLimit,
        value: balanceValue,
        tokensAmount,
      },
      {
        request,
        toAddressType,
        balance: balances['0x0'],
        tokensBalance,
      },
    )
  }

  return ethGetFeeData(
    {
      gas: transaction.gas,
      gasPrice: feePerGas,
      value: balanceValue,
      tokensAmount,
    },
    {
      balance: balances['0x0'],
      tokensBalance,
    },
  )
}
