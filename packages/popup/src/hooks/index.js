import {useEffect, useState, useMemo} from 'react'
import {useAsync} from 'react-use'
import {useRPCProvider} from '@fluent-wallet/use-rpc'
import {estimate} from '@fluent-wallet/estimate-tx'
import {iface} from '@fluent-wallet/contract-abis/777.js'
import {decode} from '@fluent-wallet/base32-address'
import {
  COMMON_DECIMALS,
  convertValueToData,
  convertDecimal,
} from '@fluent-wallet/data-format'
import {getCFXContractMethodSignature} from '@fluent-wallet/contract-method-name'
import useGlobalStore from '../stores'
import {useHistory, useLocation} from 'react-router-dom'
import {ROUTES, ANIMATE_DURING_TIME, NETWORK_TYPE} from '../constants'
import {
  useIsLocked,
  useIsZeroGroup,
  useCurrentNetwork,
  useCurrentAccount,
  useNetworkTypeIsCfx,
  useAddressType,
  useValid20Token,
  usePendingAuthReq,
} from './useApi'
import {validateAddress} from '../utils'

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

export const useEstimateTx = (tx = {}, tokensAmount = {}) => {
  const {provider} = useRPCProvider()
  const currentNetwork = useCurrentNetwork() || {type: NETWORK_TYPE.CFX}
  const {type} = currentNetwork
  const {from, to, value, data, nonce, gasPrice, gas, storageLimit} = tx
  const {
    value: rst,
    loading,
    error,
  } = useAsync(async () => {
    if (!provider || !currentNetwork?.netId || (!to && !data)) return
    return await estimate(tx, {
      type,
      request: provider.request.bind(provider),
      tokensAmount,
      isFluentRequest: true,
      // networkId: currentNetwork.netId,
    })
  }, [
    from,
    to,
    value,
    data,
    nonce,
    gasPrice,
    gas,
    storageLimit,
    // currentNetwork.netId,
    Boolean(provider),
    Object.keys(tokensAmount)?.[0],
    type,
  ])

  if (loading) {
    return {loading}
  }

  if (error) {
    console.log('error', error)
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

  const isNativeToken = !tokenAddress
  const decimals = isNativeToken ? COMMON_DECIMALS : tokenDecimals
  const sendData = convertValueToData(sendAmount, decimals) || '0x0'
  const isValid = validateAddress(toAddress, networkTypeIsCfx, netId)
  if (isNativeToken && (isValid || !toAddress)) {
    to = toAddress || address
  } else if (tokenAddress) {
    to = toAddress ? tokenAddress : ''
    data = toAddress
      ? iface.encodeFunctionData('transfer', [
          decode(toAddress).hexAddress,
          sendData,
        ])
      : ''
  }
  const params = {
    from: address,
    to,
  }
  if (isNativeToken) params['value'] = sendData
  if (data) params['data'] = data
  return params
}

export const useCheckBalanceAndGas = (
  estimateRst,
  sendToken,
  isSendToken = true,
) => {
  const {address: tokenAddress} = sendToken || {}
  const {error, isBalanceEnough, tokens} = estimateRst
  const isTokenBalanceEnough = tokens?.[tokenAddress]?.isTokenBalanceEnough
  const isNativeToken = !tokenAddress
  return useMemo(() => {
    if (error?.message) {
      if (error?.message?.indexOf('transfer amount exceeds allowance') > -1) {
        return 'transfer amount exceeds allowance'
      } else if (
        error?.message?.indexOf('transfer amount exceeds balance') > -1
      ) {
        return 'balance is not enough'
      } else {
        return 'contract error'
      }
    } else {
      if (isNativeToken && isBalanceEnough !== undefined) {
        if (!isBalanceEnough) {
          return 'balance is not enough'
        } else {
          return ''
        }
      } else if (!isNativeToken && isTokenBalanceEnough !== undefined) {
        if (isSendToken && !isTokenBalanceEnough) {
          return 'balance is not enough'
        } else if (!isBalanceEnough && isBalanceEnough !== undefined) {
          return 'gas fee is not enough'
        } else {
          return ''
        }
      }
    }
  }, [isNativeToken, isSendToken, isBalanceEnough, error, isTokenBalanceEnough])
}

export const useDappParams = () => {
  const pendingAuthReq = usePendingAuthReq()
  const [{req}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  return req?.params[0] || {}
}

export const useDecodeData = ({to, data} = {}) => {
  const [decodeData, setDecodeData] = useState({})
  const type = useAddressType(to)
  const {netId} = useCurrentNetwork()
  const isContract = type === 'contract'
  const crc20Token = useValid20Token(isContract ? to : '')
  const token = {...crc20Token, address: to}

  useEffect(() => {
    if (data && isContract) {
      getCFXContractMethodSignature(to, data, netId).then(result => {
        setDecodeData({...result})
      })
    } else {
      setDecodeData({})
    }
  }, [data, isContract, to, netId])

  return {isContract, token, decodeData}
}

export const useDecodeDisplay = ({
  isDapp,
  isContract,
  nativeToken,
  tx = {},
}) => {
  let displayToken = {},
    displayValue = '0x0',
    displayToAddress
  const {address} = useCurrentAccount()
  const {toAddress, sendToken, sendAmount} = useGlobalStore()
  const {to, data, value} = tx
  const {token, decodeData} = useDecodeData(tx)
  const isApproveToken = isDapp && decodeData?.name === 'approve'
  const isDappSendNativeToken =
    !isContract || (isContract && (!data || data === '0x'))
  const isSendToken =
    !isDapp ||
    (isDapp &&
      decodeData?.name === 'transferFrom' &&
      decodeData?.args?.[0] === address) ||
    (isDapp && isDappSendNativeToken)

  if (!isDapp) {
    displayToken = sendToken
    displayToAddress = toAddress
    displayValue = sendAmount
  } else {
    if (!isContract || isDappSendNativeToken) {
      displayToken = nativeToken
      displayToAddress = to
      displayValue = value
    }
    if (data && isContract && decodeData) {
      if (token?.symbol) displayToken = token
      if (isSendToken) {
        displayToAddress = decodeData?.args?.[1]
        displayValue = convertDecimal(
          decodeData?.args[2].toString(10),
          'divide',
          token?.decimals,
        )
      } else if (isApproveToken) {
        displayToAddress = decodeData?.args?.[0]
        displayValue = convertDecimal(
          decodeData?.args[1].toString(10),
          'divide',
          token?.decimals,
        )
        // setApproveToken(token)
      } else {
        displayToAddress = to
      }
    }
  }
  return {
    isApproveToken,
    isSendToken,
    displayToAddress,
    displayValue,
    displayToken,
  }
}

export const useViewData = ({data, to} = {}) => {
  const {decodeData, token} = useDecodeData({data, to})
  const {customAllowance} = useGlobalStore()
  const allowance =
    convertValueToData(customAllowance, token?.decimals) || '0x0'
  const spender = decodeData?.args?.[0]
    ? decode(decodeData?.args?.[0]).hexAddress
    : ''
  const viewData = useMemo(() => {
    if (customAllowance) {
      return spender
        ? iface.encodeFunctionData('approve', [spender, allowance])
        : data
    } else {
      return data
    }
  }, [customAllowance, data, allowance, spender])
  return viewData
}
