import {useCallback, useEffect, useRef, useState} from 'react'
import {convertDataToValue} from '@fluent-wallet/data-format'
import {RPC_METHODS} from '../../constants'
import {request} from '../../utils'
import {NATIVE_TOKEN_BALANCE_KEY} from '../../utils/tokenPayGas'

const {WALLET_GET_TOKEN_PAY_MAX_SENDABLE} = RPC_METHODS

/**
 * Handles SendTransaction max requests for token-pay gas.
 * It ignores stale responses after token, amount, or address changes.
 */
function useTokenPayMaxSendable({
  networkId,
  accountId,
  toAddress,
  sendTokenBalanceKey,
  gasLevel,
  decimals,
  setGasTokenAddress,
  setHasMaxGasPaymentError,
  setMaxMode,
  setSendAmount,
}) {
  const [maxLoading, setMaxLoading] = useState(false)
  const requestIdRef = useRef(0)

  const cancelMaxRequest = useCallback(() => {
    requestIdRef.current += 1
    setMaxLoading(false)
  }, [])

  useEffect(() => {
    return () => {
      requestIdRef.current += 1
    }
  }, [])

  const requestMaxSendable = useCallback(async () => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setMaxLoading(true)

    try {
      const maxSendable = await request(WALLET_GET_TOKEN_PAY_MAX_SENDABLE, {
        networkDbId: networkId,
        accountId,
        toAddress,
        sendTokenAddress: sendTokenBalanceKey,
        gasLevel: gasLevel === 'advanced' ? 'medium' : gasLevel,
      })

      if (requestIdRef.current !== requestId) return

      if (!maxSendable?.canPayGas) {
        setMaxMode(false)
        setGasTokenAddress('')
        setHasMaxGasPaymentError(true)
        return
      }

      // Keep confirm gas selection aligned with the token used by max.
      setGasTokenAddress(
        maxSendable.gasTokenAddress &&
          maxSendable.gasTokenAddress !== NATIVE_TOKEN_BALANCE_KEY
          ? maxSendable.gasTokenAddress
          : '',
      )
      setHasMaxGasPaymentError(false)
      setMaxMode(true)
      setSendAmount(convertDataToValue(maxSendable.maxSendable, decimals))
    } catch {
      if (requestIdRef.current === requestId) {
        setMaxMode(false)
        setGasTokenAddress('')
        setHasMaxGasPaymentError(true)
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setMaxLoading(false)
      }
    }
  }, [
    accountId,
    decimals,
    gasLevel,
    networkId,
    sendTokenBalanceKey,
    setGasTokenAddress,
    setHasMaxGasPaymentError,
    setMaxMode,
    setSendAmount,
    toAddress,
  ])

  return {
    maxLoading,
    cancelMaxRequest,
    requestMaxSendable,
  }
}

export default useTokenPayMaxSendable
