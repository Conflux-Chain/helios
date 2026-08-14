import {useCallback, useEffect, useMemo} from 'react'
import {
  useGetTokenPayGasOptions,
  usePrepareTokenPayQuote,
  useBalance,
} from '../../hooks/useApi'
import {useTokenPayAvailability} from '../../hooks/useTokenPay'
import {useCurrentTxStore} from '../../hooks'
import {bn16, request} from '../../utils'
import {GAS_PAYMENT_METHOD, RPC_METHODS} from '../../constants'
import {getNativeGasFee} from './components/tokenPayGasUtils'
import {getTokenPayGasLevel} from '../../utils/tokenPayGas'

const {WALLET_GET_BALANCE, WALLET_SUBMIT_TOKEN_PAY_TRANSACTION} = RPC_METHODS

function useTokenPayGas({
  isHwAccount,
  networkDbId,
  accountId,
  params,
  gasLevel,
  estimateRst,
}) {
  const {gasPayment, setGasPayment} = useCurrentTxStore()
  const gasTokenAddress =
    gasPayment?.method === GAS_PAYMENT_METHOD.TOKEN
      ? gasPayment.tokenAddress
      : ''

  const {canUseTokenPay, tokenPayConfig, tokenPayConfigLoading} =
    useTokenPayAvailability({isHwAccount, networkDbId})

  const gasTokenAddresses = tokenPayConfig?.tokens?.map(token => token.address)
  const gasTokenByAddress = useMemo(
    () =>
      (tokenPayConfig?.tokens || []).reduce((acc, token) => {
        acc[token.address.toLowerCase()] = token
        return acc
      }, {}),
    [tokenPayConfig?.tokens],
  )

  const selectedGasToken = useMemo(
    () =>
      canUseTokenPay
        ? gasTokenByAddress[gasTokenAddress?.toLowerCase()] || null
        : null,
    [canUseTokenPay, gasTokenAddress, gasTokenByAddress],
  )

  const setSelectedGasToken = useCallback(
    token => {
      setGasPayment(
        token
          ? {
              method: GAS_PAYMENT_METHOD.TOKEN,
              tokenAddress: token.address,
            }
          : {
              method: GAS_PAYMENT_METHOD.NATIVE,
            },
      )
    },
    [setGasPayment],
  )

  useEffect(() => {
    if (gasTokenAddress && isHwAccount) {
      setGasPayment({method: GAS_PAYMENT_METHOD.NATIVE})
      return
    }

    if (
      gasTokenAddress &&
      tokenPayConfig &&
      (!canUseTokenPay || !gasTokenByAddress[gasTokenAddress.toLowerCase()])
    ) {
      setGasPayment({method: GAS_PAYMENT_METHOD.NATIVE})
    }
  }, [
    canUseTokenPay,
    gasTokenAddress,
    gasTokenByAddress,
    isHwAccount,
    setGasPayment,
    tokenPayConfig,
  ])

  const gasTokenBalances = useBalance(
    params?.from,
    networkDbId,
    gasTokenAddresses || [],
  )
  const gasTokenBalancesForAccount =
    gasTokenBalances?.[params?.from?.toLowerCase()] || {}

  const isTokenPayGas =
    gasPayment?.method === GAS_PAYMENT_METHOD.TOKEN &&
    Boolean(selectedGasToken?.address)

  const tokenPayGasLevel = getTokenPayGasLevel(gasLevel)
  const canPrepareTokenPayQuote = Boolean(
    canUseTokenPay && isTokenPayGas && params?.gas,
  )

  const {
    data: tokenPayQuote,
    error: tokenPayQuoteError,
    loading: tokenPayQuoteLoading,
    isValidating: tokenPayQuoteValidating,
    mutate: mutateTokenPayQuote,
  } = usePrepareTokenPayQuote({
    networkDbId,
    accountId,
    userTx: canPrepareTokenPayQuote ? params : null,
    gasTokenAddress: selectedGasToken?.address,
    gasLevel: tokenPayGasLevel,
  })

  const nativeGasFee = getNativeGasFee(estimateRst)
  const {
    data: tokenPayGasOptions,
    error: tokenPayGasOptionsError,
    loading: tokenPayGasOptionsLoading,
  } = useGetTokenPayGasOptions({
    networkDbId,
    accountId,
    userTx: canUseTokenPay && params?.gas ? params : null,
    nativeGasFee,
    gasLevel: tokenPayGasLevel,
  })

  const tokenPayReady = Boolean(
    tokenPayQuote?.transferTokenTx &&
      tokenPayQuote?.preparedUserTx &&
      tokenPayQuote?.tokenCost,
  )

  const submitTokenPayTransaction = ({
    submitTx = params,
    maxTokenCost = tokenPayQuote?.tokenCost,
  } = {}) => {
    if (!tokenPayReady) return Promise.reject(new Error('Token pay not ready'))

    return request(WALLET_SUBMIT_TOKEN_PAY_TRANSACTION, {
      networkDbId,
      accountId,
      userTx: submitTx,
      gasTokenAddress: selectedGasToken.address,
      gasLevel: tokenPayGasLevel,
      maxTokenCost,
    })
  }

  const checkTokenPayBalance = async ({
    submitTx = params,
    displayToken,
    isNativeToken,
    isSendToken,
    sendTokenValue,
  }) => {
    const from = submitTx.from?.toLowerCase()
    const gasTokenAddress = tokenPayQuote?.gasToken?.address?.toLowerCase()
    const tokenCost = tokenPayQuote?.tokenCost

    if (!from || !gasTokenAddress || !tokenCost) return 'gasFeeIsNotEnough'

    const displayTokenAddress = displayToken?.address?.toLowerCase()
    const tokens = ['0x0', gasTokenAddress]
    if (!isNativeToken && displayTokenAddress) tokens.push(displayTokenAddress)

    try {
      const balanceData = await request(WALLET_GET_BALANCE, {
        users: [from],
        tokens: [...new Set(tokens)],
      })
      const balance = balanceData?.[from] || {}

      if (isSendToken) {
        if (isNativeToken) {
          if (bn16(balance['0x0'] || '0x0').lt(bn16(submitTx.value || '0x0'))) {
            return 'balanceIsNotEnough'
          }
        } else if (displayTokenAddress === gasTokenAddress) {
          const requiredTokenBalance = bn16(sendTokenValue).add(bn16(tokenCost))
          if (
            bn16(balance[displayTokenAddress] || '0x0').lt(requiredTokenBalance)
          ) {
            return 'balanceIsNotEnough'
          }
        } else if (
          bn16(balance[displayTokenAddress] || '0x0').lt(bn16(sendTokenValue))
        ) {
          return 'balanceIsNotEnough'
        }
      }

      if (bn16(balance[gasTokenAddress] || '0x0').lt(bn16(tokenCost))) {
        return 'gasFeeIsNotEnough'
      }

      return ''
    } catch (err) {
      console.error(err)
      return 'gasFeeIsNotEnough'
    }
  }

  return {
    selectedGasToken,
    setSelectedGasToken,
    tokenPayConfig,
    tokenPayConfigLoading,
    tokenPayQuote,
    tokenPayGasOptions,
    tokenPayGasOptionsError,
    tokenPayGasOptionsLoading,
    gasTokenBalances: gasTokenBalancesForAccount,
    tokenPayQuoteError,
    tokenPayQuoteLoading,
    tokenPayQuoteValidating,
    refreshTokenPayQuote: mutateTokenPayQuote,
    canUseTokenPay,
    isTokenPayGas,
    tokenPayReady,
    tokenPayGasLevel,
    nativeGasFee,
    checkTokenPayBalance,
    submitTokenPayTransaction,
  }
}

export default useTokenPayGas
