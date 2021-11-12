import {useEffect, useState, useMemo} from 'react'
import {useAsync} from 'react-use'
import {useRPCProvider} from '@fluent-wallet/use-rpc'
import {estimate} from '@fluent-wallet/estimate-tx'
import {iface} from '@fluent-wallet/contract-abis/777.js'
import {decode} from '@fluent-wallet/base32-address'
import {COMMON_DECIMALS, convertValueToData} from '@fluent-wallet/data-format'
import useGlobalStore from '../stores'
import {useHistory, useLocation} from 'react-router-dom'
import {ROUTES, ANIMATE_DURING_TIME, NETWORK_TYPE} from '../constants'
import {
  useIsLocked,
  useIsZeroGroup,
  useCurrentNetwork,
  useCurrentAccount,
  useNetworkTypeIsCfx,
} from './useApi'
import {validateAddress, bn16} from '../utils'

const {HOME} = ROUTES

export const useCreatedPasswordGuard = () => {
  const createdPassword = useGlobalStore(state => state.createdPassword)
  const history = useHistory()
  const zeroGroup = useIsZeroGroup()
  const lockedData = useIsLocked()

  useEffect(() => {
    if ((zeroGroup && !createdPassword) || (!zeroGroup && lockedData)) {
      history.push(HOME)
    }
  }, [createdPassword, history, zeroGroup, lockedData])
}

export const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}

export const useSlideAnimation = show => {
  const [wrapperAnimateStyle, setWrapperAnimateStyle] = useState('')
  useEffect(() => {
    if (show) {
      return setWrapperAnimateStyle('animate-slide-up block')
    }
    if (wrapperAnimateStyle && !show) {
      setWrapperAnimateStyle('animate-slide-down')

      const timer = setTimeout(() => {
        setWrapperAnimateStyle('')
        clearTimeout(timer)
      }, ANIMATE_DURING_TIME)
    }
  }, [show, wrapperAnimateStyle])
  return wrapperAnimateStyle
}

export const useFontSize = (
  targetRef,
  hiddenRef,
  maxWidth,
  value,
  initialFontSize = 14,
) => {
  useEffect(() => {
    const hiddenDom = hiddenRef.current
    const targetDom = targetRef.current
    const contentWidth = hiddenDom.offsetWidth
    if (contentWidth > maxWidth) {
      const fontSize = (maxWidth / contentWidth) * initialFontSize
      targetDom.style.fontSize = parseInt(fontSize * 100) / 100 + 'px'
    } else {
      targetDom.style.fontSize = `${initialFontSize}px`
    }
  }, [targetRef, hiddenRef, maxWidth, value, initialFontSize])
}

export const useEstimateTx = (tx = {}) => {
  const {provider} = useRPCProvider()
  const currentNetwork = useCurrentNetwork() || {type: NETWORK_TYPE.CFX}
  const {type} = currentNetwork
  const {from, to, value, data, nonce, gasPrice, gasLimit} = tx
  const {
    value: rst,
    loading,
    error,
  } = useAsync(async () => {
    if (!provider || !currentNetwork?.netId || (!to && !data)) return
    return await estimate(tx, {
      type,
      request: provider.request.bind(provider),
      isFluentRequest: true,
      networkId: currentNetwork.netId,
    })
  }, [
    from,
    to,
    value,
    data,
    nonce,
    gasPrice,
    gasLimit,
    currentNetwork.netId,
    Boolean(provider),
    type,
  ])

  if (loading) {
    return {loading}
  }

  if (error) {
    return {error}
  }

  return rst
}

export const useTxParams = () => {
  const {toAddress, sendAmount, sendToken} = useGlobalStore()
  const {decimals: tokenDecimals, address: tokenAddress} = sendToken
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const {address} = useCurrentAccount()
  const {netId} = useCurrentNetwork()
  let to, data
  console.log('sendAmout', sendAmount)

  const isNativeToken = !tokenAddress
  const decimals = isNativeToken ? COMMON_DECIMALS : tokenDecimals
  const sendData = convertValueToData(sendAmount, decimals)
  console.log('sendData', sendData)
  console.log('decimals', decimals)
  const isValid = validateAddress(toAddress, networkTypeIsCfx, netId)
  if (isNativeToken && isValid) {
    to = toAddress
  } else if (tokenAddress) {
    to = tokenAddress
    data = iface.encodeFunctionData('transfer', [
      decode(to).hexAddress,
      sendData,
    ])
  }
  const params = {
    from: address,
    to,
  }
  if (isNativeToken) params['value'] = sendData
  if (data) params['data'] = data
  console.log('params', params)
  return params
}

export const useCheckBalanceAndGas = estimateRst => {
  const {sendAmount, sendToken} = useGlobalStore()
  const {address: tokenAddress, balance: tokenBalance} = sendToken
  const {
    isBalanceEnough,
    isBalanceEnoughForValueAndFee,
    storageFeeDrip,
    error,
  } = estimateRst
  const isNativeToken = !tokenAddress
  return useMemo(() => {
    if (storageFeeDrip) {
      if (isNativeToken && !isBalanceEnoughForValueAndFee) {
        if (!isBalanceEnoughForValueAndFee) {
          return 'balance is not enough'
        } else {
          return ''
        }
      }
      if (!isNativeToken) {
        if (bn16(convertValueToData(sendAmount)).gt(bn16(tokenBalance))) {
          return 'balance is not enough'
        } else if (!isBalanceEnough) {
          return 'gas fee is not enough'
        } else {
          return ''
        }
      }
    } else if (error?.message) {
      if (error?.message?.indexOf('transfer amount exceeds allowance') > -1) {
        return 'balance is not enough'
      } else {
        return 'contract error'
      }
    } else {
      return ''
    }
  }, [
    isNativeToken,
    isBalanceEnough,
    tokenBalance,
    isBalanceEnoughForValueAndFee,
    sendAmount,
    storageFeeDrip,
    error,
  ])
}
