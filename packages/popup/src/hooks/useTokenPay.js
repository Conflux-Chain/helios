import {useTokenPayConfig} from './useApi'

export function useTokenPayAvailability({
  isDapp = false,
  isHwAccount = false,
  networkDbId,
}) {
  const {data: tokenPayConfig, loading: tokenPayConfigLoading} =
    useTokenPayConfig(networkDbId)

  return {
    canUseTokenPay: Boolean(
      !isDapp && !isHwAccount && tokenPayConfig?.available,
    ),
    tokenPayConfig,
    tokenPayConfigLoading,
  }
}
