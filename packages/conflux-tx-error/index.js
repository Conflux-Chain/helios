export function processError(err) {
  if (typeof err?.data === 'string') {
    if (err.data?.includes?.('tx already exist'))
      return {duplicateTx: true, shouldDiscard: false}
    if (err.data?.includes?.('EpochHeightOutOfBound'))
      return {epochHeightOutOfBound: true, shouldDiscard: true}
    if (err.data?.includes?.('exceeds the maximum value'))
      return {gasExceedsLimit: true, shouldDiscard: true}
    if (err.data?.includes?.('too stale nonce'))
      return {tooStaleNonce: true, shouldDiscard: true}
  }

  return {shouldDiscard: false}
}
