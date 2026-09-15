import {useMemo} from 'react'
import {PERSONAL_SIGN} from '../constants/rpcMethods'
import {detectPermitType, parseTypedData} from '../utils'
import {useAddressByNetworkId, usePendingAuthReq} from './useApi'

/**
 * Read the pending auth request and classify its typed data as a supported permit.
 */
export const useSignatureRequest = () => {
  const pendingAuthReq = usePendingAuthReq()
  const [{req, app, site}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const dappAccountId = app?.currentAccount?.eid
  const dappNetworkId = app?.currentNetwork?.eid

  const isPersonalSign = req?.method === PERSONAL_SIGN
  const {value: address} = useAddressByNetworkId(dappAccountId, dappNetworkId)
  const plaintextData = useMemo(
    () =>
      !isPersonalSign && req?.params?.[1] ? parseTypedData(req.params[1]) : {},
    [isPersonalSign, req?.params],
  )
  const permitType = useMemo(
    () =>
      detectPermitType({
        typedData: plaintextData,
        signerAddress: address,
      }),
    [plaintextData, address],
  )
  return {req, app, site, address, plaintextData, permitType}
}

export const usePermitType = () => useSignatureRequest().permitType
