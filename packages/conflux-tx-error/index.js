export function processError(err) {
  if (typeof err?.data === 'string') {
    if (err.data?.includes?.('tx already exist'))
      return {errorType: 'duplicateTx', shouldDiscard: true}
    if (err.data?.includes?.('EpochHeightOutOfBound'))
      return {errorType: 'epochHeightOutOfBound', shouldDiscard: true}
    if (err.data?.includes?.('exceeds the maximum value'))
      return {errorType: 'gasExceedsLimit', shouldDiscard: true}
    if (err.data?.includes?.('too stale nonce'))
      return {errorType: 'tooStaleNonce', shouldDiscard: true}
  }

  return {shouldDiscard: false}
}
