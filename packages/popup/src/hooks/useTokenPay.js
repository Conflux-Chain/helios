import {useTokenPayConfig} from './useApi'

export function useTokenPayAvailability({isHwAccount = false, networkDbId}) {
  const {data: tokenPayConfig, loading: tokenPayConfigLoading} =
    useTokenPayConfig(networkDbId)

  return {
    canUseTokenPay: Boolean(!isHwAccount && tokenPayConfig?.available),
    tokenPayConfig,
    tokenPayConfigLoading,
  }
}
