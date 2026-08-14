import {useCallback} from 'react'
import {useCurrentTxStore} from '../../hooks'
import {useSponsorship} from '../../hooks/useApi'
import {GAS_PAYMENT_METHOD} from '../../constants'
import useTokenPayGas from './useTokenPayGas'

function useGasPayment({
  isHwAccount,
  networkId,
  accountId,
  params,
  calls,
  sponsorshipEnabled = true,
  gasLevel,
  estimateRst,
}) {
  const {gasPayment: paymentSelection, setGasPayment} = useCurrentTxStore()

  const tokenPay = useTokenPayGas({
    isHwAccount,
    networkDbId: networkId,
    accountId,
    params,
    gasLevel,
    estimateRst,
  })

  const sponsorshipQuery = useSponsorship({
    accountId: sponsorshipEnabled ? accountId : null,
    networkId: sponsorshipEnabled ? networkId : null,
    calls: sponsorshipEnabled ? calls : null,
  })

  const sponsorship = {
    supported: sponsorshipQuery.data?.supported === true,
    available: sponsorshipQuery.data?.available === true,
    reason: sponsorshipQuery.data?.reason || '',
    maxGasCost: sponsorshipQuery.data?.maxGasCost || null,
    requiresDelegation: sponsorshipQuery.data?.requiresDelegation === true,
    loading: sponsorshipQuery.loading,
    isValidating: sponsorshipQuery.isValidating,
    error: sponsorshipQuery.error,
    refresh: sponsorshipQuery.mutate,
  }

  const defaultPayment = {method: GAS_PAYMENT_METHOD.NATIVE}
  // A persisted token selection is effective only after the current network
  // config resolves it to an available gas token.
  const hasValidTokenSelection =
    paymentSelection?.method === GAS_PAYMENT_METHOD.TOKEN &&
    tokenPay.isTokenPayGas

  const payment =
    sponsorshipEnabled && sponsorship.available
      ? {method: GAS_PAYMENT_METHOD.SPONSORED}
      : hasValidTokenSelection
      ? {
          method: GAS_PAYMENT_METHOD.TOKEN,
          tokenAddress: tokenPay.selectedGasToken.address,
        }
      : defaultPayment

  const loading = sponsorshipEnabled
    ? sponsorship.loading ||
      (!sponsorship.available && !isHwAccount && tokenPay.tokenPayConfigLoading)
    : !isHwAccount && tokenPay.tokenPayConfigLoading

  const selectPayment = useCallback(
    payment => {
      if (
        payment.method === GAS_PAYMENT_METHOD.SPONSORED &&
        !sponsorship.available
      ) {
        return
      }

      setGasPayment(payment)
    },
    [setGasPayment, sponsorship.available],
  )
  return {
    payment,
    loading,
    selectPayment,
    isNative: payment.method === GAS_PAYMENT_METHOD.NATIVE,
    isToken: payment.method === GAS_PAYMENT_METHOD.TOKEN,
    isSponsored: payment.method === GAS_PAYMENT_METHOD.SPONSORED,
    nativeGasFee: tokenPay.nativeGasFee,
    tokenPay: {
      available: tokenPay.canUseTokenPay,
      config: tokenPay.tokenPayConfig,
      configLoading: tokenPay.tokenPayConfigLoading,
      selectedToken: tokenPay.selectedGasToken,
      selectToken: tokenPay.setSelectedGasToken,
      balances: tokenPay.gasTokenBalances,
      options: tokenPay.tokenPayGasOptions,
      optionsError: tokenPay.tokenPayGasOptionsError,
      optionsLoading: tokenPay.tokenPayGasOptionsLoading,
      quote: tokenPay.tokenPayQuote,
      quoteError: tokenPay.tokenPayQuoteError,
      quoteLoading: tokenPay.tokenPayQuoteLoading,
      quoteValidating: tokenPay.tokenPayQuoteValidating,
      ready: tokenPay.tokenPayReady,
      gasLevel: tokenPay.tokenPayGasLevel,
      refreshQuote: tokenPay.refreshTokenPayQuote,
      checkBalance: tokenPay.checkTokenPayBalance,
      submit: tokenPay.submitTokenPayTransaction,
    },
    sponsorship,
  }
}

export default useGasPayment
