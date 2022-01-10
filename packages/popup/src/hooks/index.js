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
  useSingleTokenInfoWithNativeTokenSupport,
  useIsZeroGroup,
  useCurrentAddress,
  useNetworkTypeIsCfx,
  useAddressType,
  useValid20Token,
  usePendingAuthReq,
} from './useApi'
import {validateAddress} from '../utils'
import {useTranslation} from 'react-i18next'

const {HOME} = ROUTES

export const useCreatedPasswordGuard = () => {
  const {createdPassword} = useGlobalStore()
  const history = useHistory()
  const zeroGroup = useIsZeroGroup()

  useEffect(() => {
    if (zeroGroup && !createdPassword) {
      history.push(HOME)
    }
  }, [createdPassword, history, zeroGroup])
}

export const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}

export const useSlideAnimation = (
  show,
  direction = 'vertical',
  needAnimation,
) => {
  const [wrapperAnimateStyle, setWrapperAnimateStyle] = useState('')

  useEffect(() => {
    if (!needAnimation) {
      return setWrapperAnimateStyle(show ? 'block' : '')
    }
    let timer = null
    if (show) {
      setWrapperAnimateStyle(
        direction == 'vertical'
          ? 'animate-slide-up block'
          : 'animate-slide-left-in block',
      )
    } else if (wrapperAnimateStyle) {
      setWrapperAnimateStyle(
        direction == 'vertical'
          ? 'animate-slide-down'
          : 'animate-slide-left-out',
      )
      timer = setTimeout(() => {
        setWrapperAnimateStyle('')
        clearTimeout(timer)
      }, ANIMATE_DURING_TIME)
    }

    return () => {
      timer && clearTimeout(timer)
    }
  }, [show, wrapperAnimateStyle, direction, needAnimation])

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
      let intFontSize = parseInt(fontSize * 100) / 100
      if (intFontSize < 10) intFontSize = 10
      targetDom.style.fontSize = intFontSize + 'px'
    } else {
      targetDom.style.fontSize = `${initialFontSize}px`
    }
  }, [targetRef, hiddenRef, maxWidth, value, initialFontSize])
}

export const useEstimateTx = (tx = {}, tokensAmount = {}) => {
  const {provider} = useRPCProvider()
  const {
    data: {network},
  } = useCurrentAddress()
  const currentNetwork = network || {type: NETWORK_TYPE.CFX}
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
  const {toAddress, sendAmount, sendTokenId} = useGlobalStore()
  const {decimals: tokenDecimals, address: tokenAddress} =
    useSingleTokenInfoWithNativeTokenSupport(sendTokenId)
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const {
    data: {
      value: address,
      network: {netId},
    },
  } = useCurrentAddress()
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
  sendTokenAddress,
  isSendToken = true,
) => {
  console.log('estimateRst', estimateRst)
  const {t} = useTranslation()
  const {error, isBalanceEnough, tokens} = estimateRst
  const isNativeToken = !sendTokenAddress
  const isTokenBalanceEnough = tokens?.[sendTokenAddress]?.isTokenBalanceEnough
  return useMemo(() => {
    if (error?.message) {
      if (error?.message?.indexOf('transfer amount exceeds allowance') > -1) {
        return t('transferAmountExceedsAllowance')
      } else if (
        error?.message?.indexOf('transfer amount exceeds balance') > -1
      ) {
        return t('balanceIsNotEnough')
      } else {
        return t(
          'contractError' + error?.message?.split?.('\n')?.[0] ??
            error?.message ??
            error,
        )
      }
    } else {
      if (isSendToken) {
        if (isNativeToken) {
          if (isBalanceEnough === false) {
            return t('balanceIsNotEnough')
          } else {
            return ''
          }
        } else {
          if (isTokenBalanceEnough === false) {
            return t('gasFeeIsNotEnough')
          }
        }
      }
      if (isBalanceEnough === false) {
        return t('gasFeeIsNotEnough')
      } else {
        return ''
      }
    }
  }, [
    isNativeToken,
    isSendToken,
    isBalanceEnough,
    error,
    isTokenBalanceEnough,
    t,
  ])
}

export const useDappParams = customPendingAuthReq => {
  let pendingAuthReq = usePendingAuthReq()
  pendingAuthReq = customPendingAuthReq || pendingAuthReq
  const [{req}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  return req?.params[0] || {}
}

export const useDecodeData = ({to, data} = {}) => {
  const [decodeData, setDecodeData] = useState({})
  const type = useAddressType(to)
  const {
    data: {
      network: {netId},
    },
  } = useCurrentAddress()

  const isContract = type === 'contract' || type === 'builtin'
  const isOutContract = type === 'contract'
  const crc20Token = useValid20Token(isOutContract ? to : '')

  useEffect(() => {
    if (data && isContract) {
      getCFXContractMethodSignature(to, data, netId).then(result => {
        setDecodeData({...result})
      })
    } else {
      setDecodeData({})
    }
  }, [data, isContract, to, netId])

  return {isContract, token: crc20Token, decodeData}
}

export const useDecodeDisplay = ({
  isDapp,
  isContract,
  nativeToken,
  tx = {},
}) => {
  let displayToken = {},
    displayValue = '0x0',
    displayToAddress,
    displayFromAddress
  const {
    data: {value: address},
  } = useCurrentAddress()
  const {toAddress, sendTokenId, sendAmount} = useGlobalStore()
  const {from, to, data, value} = tx
  const {token, decodeData} = useDecodeData(tx)
  const isApproveToken = isDapp && decodeData?.name === 'approve'
  const isSendNativeToken = (!isContract && !!to) || !data || data === '0x'
  const isSendToken =
    !isDapp ||
    (isDapp &&
      decodeData?.name === 'transferFrom' &&
      decodeData?.args?.[0] === address) ||
    (isDapp && isSendNativeToken)

  displayToken = useSingleTokenInfoWithNativeTokenSupport(
    isDapp ? null : sendTokenId,
  )
  if (!isDapp) {
    displayFromAddress = address
    displayToAddress = toAddress
    displayValue = sendAmount
  } else {
    if (isSendNativeToken) {
      displayToken = nativeToken
      displayFromAddress = from
      displayToAddress = to
      displayValue = value
    } else {
      if (token?.symbol) displayToken = token
      if (isSendToken) {
        displayFromAddress = decodeData?.args?.[0]
        displayToAddress = decodeData?.args?.[1]
        displayValue = convertDecimal(
          decodeData?.args[2].toString(10),
          'divide',
          token?.decimals,
        )
      } else if (isApproveToken) {
        displayFromAddress = from
        displayToAddress = decodeData?.args?.[0]
        displayValue = convertDecimal(
          decodeData?.args[1].toString(10),
          'divide',
          token?.decimals,
        )
      } else {
        displayFromAddress = from
        displayToAddress = to
      }
    }
  }
  return {
    isApproveToken,
    isSendToken,
    displayFromAddress,
    displayToAddress,
    displayValue,
    displayToken,
  }
}

export const useViewData = ({data, to} = {}, isApproveToken) => {
  const {decodeData, token} = useDecodeData({data, to})
  const {customAllowance} = useGlobalStore()
  const allowance =
    convertValueToData(customAllowance, token?.decimals) || '0x0'
  const spender =
    isApproveToken && decodeData?.args?.[0]
      ? decode(decodeData?.args?.[0]).hexAddress
      : ''
  const viewData = useMemo(() => {
    if (customAllowance && isApproveToken) {
      return spender
        ? iface.encodeFunctionData('approve', [spender, allowance])
        : data
    } else {
      return data
    }
  }, [customAllowance, data, allowance, spender, isApproveToken])
  return viewData
}
