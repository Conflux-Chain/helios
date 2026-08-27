import {useCallback} from 'react'
import {useCurrentTxStore} from '../../hooks'
import {GAS_PAYMENT_METHOD} from '../../constants'
import useTokenPayGas from './useTokenPayGas'
import useSponsorship from './useSponsorship'

function useGasPayment({
  isHwAccount,
  networkId,
  accountId,
  params,
  sponsorshipCalls,
  gasLevel,
  estimateRst,
}) {
  const {
    gasPayment: paymentSelection,
    sponsorshipDeclined,
    setGasPayment,
  } = useCurrentTxStore()

  const tokenPay = useTokenPayGas({
    isHwAccount,
    networkDbId: networkId,
    accountId,
    params,
    gasLevel,
    estimateRst,
  })

  const sponsorship = useSponsorship({
    accountId,
    networkId,
    calls: sponsorshipCalls,
  })

  const isSponsorshipSelected = sponsorship.available && !sponsorshipDeclined

  const defaultPayment = {method: GAS_PAYMENT_METHOD.NATIVE}
  // A persisted token selection is effective only after the current network
  // config resolves it to an available gas token.
  const hasValidTokenSelection =
    paymentSelection?.method === GAS_PAYMENT_METHOD.TOKEN &&
    tokenPay.isTokenPayGas

  const payment = isSponsorshipSelected
    ? {method: GAS_PAYMENT_METHOD.SPONSORED}
    : hasValidTokenSelection
    ? {
        method: GAS_PAYMENT_METHOD.TOKEN,
        tokenAddress: tokenPay.selectedGasToken.address,
      }
    : defaultPayment

  const loading =
    sponsorship.loading ||
    (!isSponsorshipSelected && !isHwAccount && tokenPay.tokenPayConfigLoading)

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
