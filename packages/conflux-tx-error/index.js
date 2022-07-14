// shouldDiscard means should stop tracking this tx
export function processError(err) {
  if (typeof err?.data === 'string') {
    if (err.data?.match?.(/pool is full/i))
      return {errorType: 'txPoolFull', shouldDiscard: true}
    if (err.data?.includes?.('too distant future'))
      return {errorType: 'tooDistantFuture', shouldDiscard: true}
    if (err.data?.includes?.('tx already exist'))
      return {errorType: 'duplicateTx', shouldDiscard: false}
    if (err.data?.includes?.('too stale nonce'))
      return {errorType: 'tooStaleNonce', shouldDiscard: true}
    if (err.data?.match?.(/same nonce already inserted.*replace.*gas price/))
      return {errorType: 'replacedWithHigherGasPriceTx', shouldDiscard: true}
    if (err.data?.includes?.('EpochHeightOutOfBound'))
      return {errorType: 'epochHeightOutOfBound', shouldDiscard: true}
    if (err.data?.match?.(/gas price.*less than the minimum value/))
      return {errorType: 'gasPriceTooLow', shouldDiscard: true}
    if (err.data?.includes?.('exceeds the maximum value'))
      return {errorType: 'gasExceedsLimit', shouldDiscard: true}
    if (err.data?.includes?.('Unsupported receiver address type'))
      return {errorType: 'wrongAddressType', shouldDiscard: true}
    if (err.data?.includes?.('ChainIdMismatch'))
      return {errorType: 'chainIdMismatch', shouldDiscard: true}
    if (err.data?.includes?.('ZeroGasPrice'))
      return {errorType: 'zeroGasPrice', shouldDiscard: true}
    if (err.data?.includes?.('NotEnoughBaseGas'))
      return {errorType: 'notEnoughBaseGas', shouldDiscard: true}
    if (err.data?.includes?.('RlpIncorrectListLen'))
      return {errorType: 'rlpIncorrectListLen', shouldDiscard: true}
    if (err.data?.includes?.('still in the catch up mode'))
      return {errorType: 'nodeInCatchUpMode', shouldDiscard: true}
    if (err.data?.includes?.('Can not recover pubkey'))
      return {errorType: 'canNotRecoverPubKey', shouldDiscard: true}
  }

  return {errorType: 'unknownError', shouldDiscard: true}
}
