export function shouldShowNegativeAmount({
  amount,
  methodName,
  methodArgs,
  accountAddress,
  isExternalTx = false,
}) {
  if (!amount || amount === '0' || methodName === 'approve' || isExternalTx) {
    return false
  }

  if (methodName !== 'transferFrom') {
    return true
  }

  const owner = methodArgs?.[0]

  return Boolean(
    owner &&
      accountAddress &&
      owner.toLowerCase() === accountAddress.toLowerCase(),
  )
}
