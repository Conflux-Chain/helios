import {
  Big,
  convertValueToData,
  formatDecimalToHex,
  formatHexToDecimal,
  GWEI_DECIMALS,
} from '@fluent-wallet/data-format'

/**
 * User choices for transaction fees, limits, and nonce.
 * Numeric fields use decimal integer strings. '0' is an explicit value.
 * undefined keeps the original value. '' requests an automatic value.
 * A fee level ignores the original prices. Explicit prices still take priority.
 * 'advanced' is a display label, not a saved gasLevel.
 *
 * @typedef {Object} TxOptions
 * @property {'low'|'medium'|'high'} [gasLevel] Fee level. Suggestions default to medium.
 * @property {string} [gasPrice] Legacy gas price in wei/drip.
 * @property {string} [maxFeePerGas] EIP-1559 maximum fee per gas in wei/drip.
 * @property {string} [maxPriorityFeePerGas] EIP-1559 priority fee per gas in wei/drip.
 * @property {string} [gasLimit] Gas limit.
 * @property {string} [storageLimit] CFX storage limit.
 * @property {string} [nonce] The user's transaction nonce.
 */

/**
 * Apply user choices, fee suggestions, and estimated Gas/Storage limits.
 * Transaction numbers use hex strings.
 * The caller checks estimate readiness and validates the selected limits.
 *
 * @param {Object} params
 * @param {Object|null} [params.tx] Original transaction.
 * @param {TxOptions|null} [params.txOptions] User choices.
 * @param {Object} [params.feeSuggestions] Recommended gas prices.
 * @param {Object} [params.limitEstimate] Latest Gas and Storage limit estimates.
 * @param {boolean} [params.uses1559Fees] Whether the transaction uses EIP-1559 fees.
 * @returns {Object} A new transaction with RPC hex quantities.
 */
export function applyTxOptions({
  tx,
  txOptions,
  feeSuggestions,
  limitEstimate,
  uses1559Fees,
}) {
  const settings = txOptions || {}
  const fees = feeSuggestions?.gasInfoEip1559?.[settings.gasLevel || 'medium']

  // A selected fee level ignores the original prices.
  const initialPrices = settings.gasLevel ? {} : tx

  const transaction = {
    ...tx,
    gas: selectLimit({
      originalLimit: tx?.gas,
      userLimit: settings.gasLimit,
      estimatedLimit: limitEstimate?.estimatedGasLimit,
    }),
    storageLimit: selectLimit({
      originalLimit: tx?.storageLimit,
      userLimit: settings.storageLimit,
      estimatedLimit: limitEstimate?.estimatedStorageLimit,
    }),
    nonce:
      settings.nonce === undefined
        ? tx?.nonce
        : formatDecimalToHex(settings.nonce),
  }
  if (uses1559Fees) {
    delete transaction.gasPrice

    transaction.maxFeePerGas =
      settings.maxFeePerGas === undefined
        ? initialPrices?.maxFeePerGas
        : formatDecimalToHex(settings.maxFeePerGas)

    transaction.maxPriorityFeePerGas =
      settings.maxPriorityFeePerGas === undefined
        ? initialPrices?.maxPriorityFeePerGas
        : formatDecimalToHex(settings.maxPriorityFeePerGas)

    if (!transaction.maxFeePerGas && fees?.suggestedMaxFeePerGas) {
      transaction.maxFeePerGas = convertValueToData(
        new Big(fees.suggestedMaxFeePerGas).round(9).toString(10),
        GWEI_DECIMALS,
      )
    }

    if (
      !transaction.maxPriorityFeePerGas &&
      fees?.suggestedMaxPriorityFeePerGas
    ) {
      transaction.maxPriorityFeePerGas = convertValueToData(
        new Big(fees.suggestedMaxPriorityFeePerGas).round(9).toString(10),
        GWEI_DECIMALS,
      )
    }
  } else {
    delete transaction.maxFeePerGas
    delete transaction.maxPriorityFeePerGas

    transaction.gasPrice =
      (settings.gasPrice === undefined
        ? initialPrices?.gasPrice
        : formatDecimalToHex(settings.gasPrice)) || feeSuggestions?.gasPrice
  }

  if (!transaction.gas) delete transaction.gas
  if (!transaction.storageLimit) delete transaction.storageLimit
  if (!transaction.nonce) delete transaction.nonce
  if (!transaction.gasPrice) delete transaction.gasPrice
  if (!transaction.maxFeePerGas) delete transaction.maxFeePerGas
  if (!transaction.maxPriorityFeePerGas) delete transaction.maxPriorityFeePerGas

  return transaction
}

/**
 * Get the fee level to display. This value is not stored in txOptions.
 *
 * @param {Object} params
 * @param {Object|null} [params.tx] Original transaction.
 * @param {TxOptions|null} [params.txOptions] User choices.
 * @param {boolean} [params.uses1559Fees] Whether the transaction uses EIP-1559 fees.
 * @returns {'low'|'medium'|'high'|'advanced'} The displayed fee level.
 */
export function getSelectedGasLevel({tx, txOptions, uses1559Fees}) {
  const settings = txOptions || {}
  const initialPrices = settings.gasLevel ? {} : tx

  const gasPrice = settings.gasPrice ?? initialPrices?.gasPrice
  const maxFeePerGas = settings.maxFeePerGas ?? initialPrices?.maxFeePerGas
  const maxPriorityFeePerGas =
    settings.maxPriorityFeePerGas ?? initialPrices?.maxPriorityFeePerGas

  const hasCustomPrices = uses1559Fees
    ? maxFeePerGas || maxPriorityFeePerGas
    : gasPrice

  return hasCustomPrices ? 'advanced' : settings.gasLevel || 'medium'
}

/**
 * Select a Gas or Storage limit after input validation.
 *
 * originalLimit / estimatedLimit: hex quantities.
 * userLimit: decimal integer string.
 * undefined inherits the original value; '' requests an automatic value.
 *
 * The caller checks the selected value against the estimate and chain limits.
 */
function selectLimit({originalLimit, userLimit, estimatedLimit}) {
  if (userLimit === '') {
    return estimatedLimit
  }

  // Preserve explicit user choices, including zero.
  if (userLimit !== undefined) {
    return formatDecimalToHex(userLimit)
  }

  // Keep the original value for display while estimation is unavailable.
  if (estimatedLimit === undefined) {
    return originalLimit
  }

  if (originalLimit === undefined) {
    return estimatedLimit
  }

  const original = new Big(formatHexToDecimal(originalLimit))
  const estimated = new Big(formatHexToDecimal(estimatedLimit))

  return original.lt(estimated) ? estimatedLimit : originalLimit
}
