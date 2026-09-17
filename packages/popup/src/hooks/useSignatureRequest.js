import {useMemo} from 'react'
import {PERSONAL_SIGN} from '../constants/rpcMethods'
import {useAddressByNetworkId, usePendingAuthReq} from './useApi'

/**
 * Parse a typed-data JSON object for EIP-712 or CIP-23 without schema validation.
 * Return an empty object for invalid JSON or non-object input.
 */
const parseTypedData = value => {
  if (typeof value !== 'string') return {}

  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : {}
  } catch {
    return {}
  }
}

/**
 * Read the pending signature request, resolve its account, and parse typed data.
 */
export const useSignatureRequest = () => {
  const pendingAuthReq = usePendingAuthReq()
  const [{req, app, site}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const dappAccountId = app?.currentAccount?.eid
  const dappNetworkId = app?.currentNetwork?.eid

  const isPersonalSign = req?.method === PERSONAL_SIGN
  const {value: address} = useAddressByNetworkId(dappAccountId, dappNetworkId)
  const typedData = useMemo(
    () =>
      !isPersonalSign && req?.params?.[1] ? parseTypedData(req.params[1]) : {},
    [isPersonalSign, req?.params],
  )
  return {req, app, site, address, typedData}
}
