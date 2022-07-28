// shouldDiscard means should stop tracking this tx
// error from geth txpool error
// https://github.com/ethereum/go-ethereum/blob/2d20fed893faa894f50af709349b13b6ad9b45db/core/tx_pool.go#L56
// https://github.com/ethereum/go-ethereum/blob/2d20fed893faa894f50af709349b13b6ad9b45db/light/txpool.go#L356
// https://github.com/ethereum/go-ethereum/blob/2d20fed893faa894f50af709349b13b6ad9b45db/core/error.go#L48
// https://github.com/ethereum/go-ethereum/blob/2d20fed893faa894f50af709349b13b6ad9b45db/core/state_transition.go#L214
export function processError(err) {
  if (typeof err?.data === 'string' || typeof err?.message === 'string') {
    const errstr = err.data || err.message || ''
    if (
      /known transaction/i.test(errstr) ||
      /tx already exist/i.test(errstr) ||
      /already known/i.test(errstr) ||
      /transaction with the same hash was already imported/i.test(errstr)
    )
      return {errorType: 'duplicateTx', shouldDiscard: false}
    if (
      /replacement transaction underpriced/i.test(errstr) ||
      /gas price too low to replace/i.test(errstr)
    )
      return {errorType: 'replaceUnderpriced', shouldDiscard: true}

    // ErrUnderpriced is returned if a transaction's gas price is below the minimum
    if (/transaction underpriced/i.test(errstr))
      return {errorType: 'gasTooLow', shouldDiscard: true}

    if (/pool is full/i.test(errstr))
      return {errorType: 'txPoolFull', shouldDiscard: true}
    if (/exceeds block gas limit/i.test(errstr))
      return {errorType: 'gasExceedsLimit', shouldDiscard: true}
    // https://github.com/ethereum/go-ethereum/blob/2d20fed893faa894f50af709349b13b6ad9b45db/core/error.go#L58
    if (/gas limit reached/i.test(errstr))
      return {errorType: 'gasLimitReached', shouldDiscard: false}
    if (/oversized data/i.test(errstr))
      return {errorType: 'oversizedData', shouldDiscard: true}
    if (/nonce too low/i.test(errstr) || /too stale nonce/i.test(errstr))
      return {errorType: 'tooStaleNonce', shouldDiscard: true}
    if (/nonce too high/i.test(errstr))
      return {errorType: 'nonceTooHigh', shouldDiscard: true}
    if (/nonce has max value/i.test(errstr))
      return {errorType: 'nonceMax', shouldDiscard: true}
    if (/insufficient funds/i.test(errstr))
      return {errorType: 'insufficientFunds', shouldDiscard: true}
    if (/ZeroGasPrice/.test(errstr))
      return {errorType: 'zeroGasPrice', shouldDiscard: true}
    if (/gas price.*less than the minimum value/.test(errstr))
      return {errorType: 'gasPriceTooLow', shouldDiscard: true}
    if (/intrinsic gas too low/i.test(errstr))
      return {errorType: 'intrinsicGas', shouldDiscard: true}
    if (/transaction type not supported/i.test(errstr))
      return {errorType: 'txTypeNotSupported', shouldDiscard: true}
    if (/max fee per gas higher than/i.test(errstr))
      return {errorType: 'feeCapVeryHigh', shouldDiscard: true}
    if (/max fee per gas less than block base fee/i.test(errstr))
      return {errorType: 'feeCapTooLow', shouldDiscard: true}
    if (/max priority fee per gas higher than max fee per gas/i.test(errstr))
      return {errorType: 'tipAboveFeeCap', shouldDiscard: true}
    if (/max priority fee per gas higher than/i.test(errstr))
      return {errorType: 'tipVeryHigh', shouldDiscard: true}
    if (/EpochHeightOutOfBound/.test(errstr))
      return {errorType: 'epochHeightOutOfBound', shouldDiscard: true}
    if (/exceeds the maximum value/.test(errstr))
      return {errorType: 'gasExceedsLimit', shouldDiscard: true}
    if (/NotEnoughBaseGas/.test(errstr))
      return {errorType: 'notEnoughBaseGas', shouldDiscard: true}
    // can't find this error in geth
    if (/invalid chainid/i.test(errstr))
      return {errorType: 'chainIdMismatch', shouldDiscard: true}
  }

  return {errorType: 'unknownError', shouldDiscard: true}
}
