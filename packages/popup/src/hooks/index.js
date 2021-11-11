import {useEffect, useState} from 'react'
import useGlobalStore from '../stores'
import {useHistory, useLocation} from 'react-router-dom'
import {ROUTES, ANIMATE_DURING_TIME, NETWORK_TYPE} from '../constants'
import {useRPCProvider} from '@fluent-wallet/use-rpc'
import {estimate} from '@fluent-wallet/estimate-tx'
import {useIsLocked, useIsZeroGroup, useCurrentNetwork} from './useApi'
import {useAsync} from 'react-use'

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
  const {from, to, value, data, nonce} = tx
  const {
    value: rst,
    loading,
    error,
  } = useAsync(async () => {
    if (!provider || !currentNetwork?.netId) return
    return await estimate(tx, {
      type,
      request: provider.request.bind(provider),
      isFluentRequest: true,
      networkId: currentNetwork.netId,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, value, data, nonce, currentNetwork.netId])

  if (loading) {
    return {loading}
  }

  if (error) {
    return {error}
  }

  return rst
}
