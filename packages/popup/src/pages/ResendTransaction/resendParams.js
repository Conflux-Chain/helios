import {ETH_TX_TYPES} from '@fluent-wallet/consts'

const CANCELLATION_RESEND_TYPES = ['cancel', 'expeditedCancellation']
const EIP7702_AUTHORIZATION_REQUEST_FIELDS = ['chainId', 'address', 'nonce']

const isCancellationResendType = resendType =>
  CANCELLATION_RESEND_TYPES.includes(resendType)

const hasAuthorizationList = txPayload =>
  Array.isArray(txPayload?.authorizationList) &&
  txPayload.authorizationList.length > 0

const isEip7702TxPayload = txPayload =>
  txPayload?.type === ETH_TX_TYPES.EIP7702 || hasAuthorizationList(txPayload)

export const omitFalsyTxParams = (txParams = {}, extraParams = {}) =>
  Object.entries({...txParams, ...extraParams}).reduce(
    (txParams, [key, value]) => {
      if (value) {
        txParams[key] = value
      }
      return txParams
    },
    {},
  )

const getAuthorizationRecordValue = authorizationRecord =>
  authorizationRecord?.eip7702Authorization || authorizationRecord

export const getEip7702AuthorizationRequestsFromTxPayload = txPayload => {
  if (!hasAuthorizationList(txPayload)) return []

  // History stores DB records. Resend needs unsigned requests.
  // eth_signTransaction will sign them again.
  return txPayload.authorizationList
    .map(authorizationRecord => {
      const authorization = getAuthorizationRecordValue(authorizationRecord)
      if (!authorization?.address) return null

      return EIP7702_AUTHORIZATION_REQUEST_FIELDS.reduce(
        (authorizationRequest, key) => {
          if (authorization[key] !== undefined) {
            authorizationRequest[key] = authorization[key]
          }
          return authorizationRequest
        },
        {},
      )
    })
    .filter(Boolean)
}

const getCompleteEip7702AuthorizationRequests = txPayload => {
  const authorizationRequests =
    getEip7702AuthorizationRequestsFromTxPayload(txPayload)

  return authorizationRequests.length === txPayload.authorizationList?.length
    ? authorizationRequests
    : null
}

const buildSpeedupTxParams = txPayload => {
  const txParams = {
    type: isEip7702TxPayload(txPayload) ? ETH_TX_TYPES.EIP7702 : txPayload.type,
    from: txPayload.from,
    to: txPayload.to,
    nonce: txPayload.nonce,
    value: txPayload.value,
    data: txPayload.data,
    accessList: txPayload.accessList,
  }

  if (!isEip7702TxPayload(txPayload)) {
    return {txParams: omitFalsyTxParams(txParams)}
  }

  const authorizationList = getCompleteEip7702AuthorizationRequests(txPayload)

  if (!authorizationList) {
    return {txParams: {}}
  }

  return {
    txParams: omitFalsyTxParams({
      ...txParams,
      authorizationList,
    }),
  }
}

const buildCancellationTxParams = txPayload => ({
  txParams: omitFalsyTxParams({
    // EIP-7702 cancel is a normal replacement tx.
    type: isEip7702TxPayload(txPayload) ? undefined : txPayload.type,
    from: txPayload.from,
    to: txPayload.from,
    nonce: txPayload.nonce,
    value: '0x0',
  }),
})

export const buildResendTxParams = ({resendType, txPayload = {}} = {}) => {
  if (!resendType || !Object.keys(txPayload).length) {
    return {txParams: {}}
  }

  if (isCancellationResendType(resendType)) {
    return buildCancellationTxParams(txPayload)
  }

  return buildSpeedupTxParams(txPayload)
}
