import {useCallback, useEffect, useMemo} from 'react'
import {
  useGetTokenPayGasOptions,
  usePrepareTokenPayQuote,
  useBalance,
} from '../../hooks/useApi'
import {useTokenPayAvailability} from '../../hooks/useTokenPay'
import {useCurrentTxStore} from '../../hooks'
import {bn16, request} from '../../utils'
import {RPC_METHODS} from '../../constants'
import {getNativeGasFee} from './components/tokenPayGasUtils'

const {WALLET_GET_BALANCE, WALLET_SUBMIT_TOKEN_PAY_TRANSACTION} = RPC_METHODS

function useTokenPayGas({
  isDapp,
  isHwAccount,
  networkDbId,
  accountId,
  params,
  gasLevel,
  estimateRst,
}) {
  const {gasTokenAddress, setGasTokenAddress} = useCurrentTxStore()
  const {canUseTokenPay, tokenPayConfig, tokenPayConfigLoading} =
    useTokenPayAvailability({isDapp, isHwAccount, networkDbId})
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
      setGasTokenAddress(token?.address || '')
    },
    [setGasTokenAddress],
  )

  useEffect(() => {
    if (gasTokenAddress && (isDapp || isHwAccount)) {
      setGasTokenAddress('')
      return
    }

    if (
      gasTokenAddress &&
      tokenPayConfig &&
      !gasTokenByAddress[gasTokenAddress.toLowerCase()]
    ) {
      setGasTokenAddress('')
    }
  }, [
    gasTokenAddress,
    gasTokenByAddress,
    isDapp,
    isHwAccount,
    setGasTokenAddress,
    tokenPayConfig,
  ])

  const gasTokenBalances = useBalance(
    params?.from,
    networkDbId,
    gasTokenAddresses || [],
  )
  const gasTokenBalancesForAccount =
    gasTokenBalances?.[params?.from?.toLowerCase()] || {}
  const isTokenPayGas = Boolean(selectedGasToken?.address)
  const tokenPayGasLevel = gasLevel === 'advanced' ? 'medium' : gasLevel
  const canPrepareTokenPayQuote = Boolean(
    canUseTokenPay && isTokenPayGas && params?.gas,
  )

  const {
    data: tokenPayQuote,
    error: tokenPayQuoteError,
    loading: tokenPayQuoteLoading,
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
  })

  const tokenPayReady = Boolean(
    tokenPayQuote?.transferTokenTx &&
      tokenPayQuote?.preparedUserTx &&
      tokenPayQuote?.tokenCost,
  )

  const submitTokenPayTransaction = () => {
    if (!tokenPayReady) return Promise.reject(new Error('Token pay not ready'))

    return request(WALLET_SUBMIT_TOKEN_PAY_TRANSACTION, {
      networkDbId,
      accountId,
      userTx: params,
      gasTokenAddress: selectedGasToken.address,
      gasLevel: tokenPayGasLevel,
      maxTokenCost: tokenPayQuote.tokenCost,
    })
  }

  const checkTokenPayBalance = async ({
    displayToken,
    isNativeToken,
    isSendToken,
    sendTokenValue,
  }) => {
    const from = params.from?.toLowerCase()
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
          if (bn16(balance['0x0'] || '0x0').lt(bn16(params.value || '0x0'))) {
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
    canUseTokenPay,
    isTokenPayGas,
    tokenPayReady,
    nativeGasFee,
    checkTokenPayBalance,
    submitTokenPayTransaction,
  }
}

export default useTokenPayGas
