// shouldDiscard means should stop tracking this tx
// error from geth txpool error
// https://github.com/ethereum/go-ethereum/blob/2d20fed893faa894f50af709349b13b6ad9b45db/core/tx_pool.go#L56
// https://github.com/ethereum/go-ethereum/blob/2d20fed893faa894f50af709349b13b6ad9b45db/light/txpool.go#L356
// https://github.com/ethereum/go-ethereum/blob/2d20fed893faa894f50af709349b13b6ad9b45db/core/error.go#L48
// https://github.com/ethereum/go-ethereum/blob/2d20fed893faa894f50af709349b13b6ad9b45db/core/state_transition.go#L214
export function processError(err) {
  if (typeof err?.data === 'string') {
    if (
      /known transaction/i.test(err.data || '') ||
      /already known/i.test(err.data || '') ||
      /transaction with the same hash was already imported/i.test(
        err.data || '',
      )
    )
      return {errorType: 'duplicateTx', shouldDiscard: false}
    if (/replacement transaction underpriced/i.test(err.data || ''))
      return {errorType: 'replaceUnderpriced', shouldDiscard: true}
    if (/transaction underpriced/i.test(err.data || ''))
      return {errorType: 'gasTooLow', shouldDiscard: true}
    if (
      /tx\s?pool is full/i.test(err.data || '') ||
      /transaction pool is full/i.test(err.data || '')
    )
      return {errorType: 'txPoolFull', shouldDiscard: true}
    if (/exceeds block gas limit/i.test(err.data || ''))
      return {errorType: 'gasExceedsLimit', shouldDiscard: true}
    // https://github.com/ethereum/go-ethereum/blob/2d20fed893faa894f50af709349b13b6ad9b45db/core/error.go#L58
    if (/gas limit reached/i.test(err.data || ''))
      return {errorType: 'gasLimitReached', shouldDiscard: false}
    if (/oversized data/i.test(err.data || ''))
      return {errorType: 'oversizedData', shouldDiscard: true}
    if (/nonce too low/i.test(err.data || ''))
      return {errorType: 'tooStaleNonce', shouldDiscard: true}
    if (/nonce too high/i.test(err.data || ''))
      return {errorType: 'nonceTooHigh', shouldDiscard: true}
    if (/nonce has max value/i.test(err.data || ''))
      return {errorType: 'nonceMax', shouldDiscard: true}
    if (/insufficient funds/i.test(err.data || ''))
      return {errorType: 'insufficientFunds', shouldDiscard: true}
    if (/intrinsic gas too low/i.test(err.data || ''))
      return {errorType: 'intrinsicGas', shouldDiscard: true}
    if (/transaction type not supported/i.test(err.data || ''))
      return {errorType: 'txTypeNotSupported', shouldDiscard: true}
    if (/max fee per gas higher than/i.test(err.data || ''))
      return {errorType: 'feeCapVeryHigh', shouldDiscard: true}
    if (/max fee per gas less than block base fee/i.test(err.data || ''))
      return {errorType: 'feeCapTooLow', shouldDiscard: true}
    if (
      /max priority fee per gas higher than max fee per gas/i.test(
        err.data || '',
      )
    )
      return {errorType: 'tipAboveFeeCap', shouldDiscard: true}
    if (/max priority fee per gas higher than/i.test(err.data || ''))
      return {errorType: 'tipVeryHigh', shouldDiscard: true}
    // can't find this error in geth
    if (/invalid chainid/i.test(err.data || ''))
      return {errorType: 'chainIdMismatch', shouldDiscard: true}
  }

  return {errorType: 'unknownError', shouldDiscard: true}
}
