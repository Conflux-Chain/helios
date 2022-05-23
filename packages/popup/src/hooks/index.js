import {useEffect, useState, useMemo} from 'react'
import i18next from 'i18next'
import {useTranslation} from 'react-i18next'
import create from 'zustand'
import {useAsync} from 'react-use'
import {useRPCProvider} from '@fluent-wallet/use-rpc'
import {estimate} from '@fluent-wallet/estimate-tx'
import {iface} from '@fluent-wallet/contract-abis/777.js'
import {decode, validateBase32Address} from '@fluent-wallet/base32-address'
import {Conflux, Ethereum} from '@fluent-wallet/ledger'
import {
  COMMON_DECIMALS,
  convertValueToData,
  convertDecimal,
} from '@fluent-wallet/data-format'
import {
  getCFXContractMethodSignature,
  getEthContractMethodSignature,
} from '@fluent-wallet/contract-method-name'
import useGlobalStore from '../stores'
import {useHistory, useLocation} from 'react-router-dom'
import {ROUTES, ANIMATE_DURING_TIME, NETWORK_TYPE} from '../constants'
import {
  useSingleTokenInfoWithNativeTokenSupport,
  useDataForPopup,
  useCurrentAddress,
  useAddress,
  useNetworkTypeIsCfx,
  useAddressType,
  useValid20Token,
  usePendingAuthReq,
} from './useApi'
import {validateAddress} from '../utils'

const {HOME} = ROUTES

export const useCreatedPasswordGuard = () => {
  const {createdPassword} = useGlobalStore()
  const history = useHistory()
  const {zeroGroup} = useDataForPopup()

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
      }, ANIMATE_DURING_TIME)
    }

    return () => {
      clearTimeout(timer)
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
    if (
      !provider ||
      !currentNetwork?.netId ||
      (!to && !data) ||
      !network.chainId
    )
      return
    return await estimate(tx, {
      type,
      request: provider.request.bind(provider),
      tokensAmount,
      isFluentRequest: true,
      chainIdToGasBuffer: {[network.chainId]: network.gasBuffer},
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
    network.chainId,
    network.gasBuffer,
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

const defaultSendTransactionParams = {
  toAddress: '',
  sendAmount: '',
  gasPrice: '',
  gasLimit: '',
  storageLimit: '',
  data: '',
  nonce: '',
  sendTokenId: 'native',
  customAllowance: '',
  tx: {},
}

export const useCurrentTxStore = create(set => ({
  ...defaultSendTransactionParams,

  setTx: tx => set({tx}),
  setData: data => set({data}),
  setToAddress: toAddress => set({toAddress}),
  setSendAmount: sendAmount => set({sendAmount}),
  setGasPrice: gasPrice => set({gasPrice}),
  setGasLimit: gasLimit => set({gasLimit}),
  setStorageLimit: storageLimit => set({storageLimit}),
  setCustomAllowance: customAllowance => set({customAllowance}),
  setNonce: nonce => set({nonce}),
  setSendTokenId: sendTokenId => set({sendTokenId}),
  clearSendTransactionParams: () => set({...defaultSendTransactionParams}),
}))

// TODO: support max mode
// TODO: combine estimate here
// MAYBE: support multiple tx and rename this to useTxParams
export const useCurrentTxParams = () => {
  const txStore = useCurrentTxStore()
  const {toAddress, sendAmount, sendTokenId, setData, setTx} = txStore

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
          validateBase32Address(toAddress)
            ? decode(toAddress).hexAddress
            : toAddress,
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

  useEffect(() => {
    if (data) setData(data)
    setTx(params)
  }, [JSON.stringify(params)])

  return txStore
}

export const useCheckBalanceAndGas = (
  estimateRst,
  sendTokenAddress,
  isNativeToken,
  isSendToken = true,
) => {
  const {t} = useTranslation()
  const {error, isBalanceEnough, tokens} = estimateRst
  const isTokenBalanceEnough = tokens?.[sendTokenAddress]?.isTokenBalanceEnough
  return useMemo(() => {
    if (error?.message) {
      if (error?.message?.indexOf('transfer amount exceeds allowance') > -1) {
        return t('transferAmountExceedsAllowance')
      } else if (
        error?.message?.indexOf('transfer amount exceeds balance') > -1 ||
        error?.message?.indexOf('insufficient funds') > -1 ||
        error?.message?.indexOf('NotEnoughCash') > -1
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
            return t('balanceIsNotEnough')
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
      network: {netId, type: currentNetworkType},
    },
  } = useCurrentAddress()

  const isContract = type === 'contract' || type === 'builtin'
  const isOutContract = type === 'contract'
  const crc20Token = useValid20Token(isOutContract ? to : '')

  useEffect(() => {
    if (data && isContract && currentNetworkType) {
      if (crc20Token.valid === false) {
        return setDecodeData({name: 'unknown'})
      }

      if (crc20Token.valid === true) {
        const getSignature =
          currentNetworkType === NETWORK_TYPE.CFX
            ? getCFXContractMethodSignature
            : getEthContractMethodSignature
        const params =
          currentNetworkType === NETWORK_TYPE.CFX ? [to, data, netId] : [data]

        getSignature(...params)
          .then(result => {
            setDecodeData({...result})
          })
          .catch(() => {
            setDecodeData({name: 'unknown'})
          })
        return
      }
    }

    setDecodeData({})
  }, [data, isContract, to, netId, currentNetworkType, crc20Token.valid])

  return {isContract, token: crc20Token, decodeData}
}

export const useDecodeDisplay = ({
  deps,
  isDapp,
  isContract,
  nativeToken,
  pendingAuthReq = {},
  tx = {},
}) => {
  let displayToken = {},
    displayValue = '0x0',
    displayAccount,
    displayToAddress,
    displayFromAddress
  const {from, to, data, value} = tx
  const {toAddress, sendTokenId, sendAmount} = useCurrentTxParams()
  const {
    data: {value: address, account},
  } = useAddress({
    deps,
    value: from,
    stop: isDapp && !pendingAuthReq?.app?.currentAccount?.eid,
    selected: isDapp ? undefined : true,
    appId: isDapp && pendingAuthReq?.app?.eid,
  })

  displayAccount = account
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
    displayAccount,
    displayValue,
    displayToken,
  }
}

export const useViewData = ({data, to} = {}, isApproveToken) => {
  const {decodeData, token} = useDecodeData({data, to})
  const {customAllowance} = useCurrentTxParams()
  const allowance =
    convertValueToData(customAllowance, token?.decimals) || '0x0'
  const firstArg = decodeData?.args?.[0]
  const spender =
    isApproveToken && firstArg
      ? validateBase32Address(firstArg)
        ? decode(firstArg).hexAddress
        : firstArg
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

export const useDisplayErrorMessage = errorMessage => {
  const [displayErrorMessage, setDisplayErrorMessage] = useState('')
  const {t, i18n} = useTranslation()
  useEffect(() => {
    setDisplayErrorMessage(
      i18next.exists(errorMessage) ? t(errorMessage) : errorMessage,
    )
  }, [i18n.language, errorMessage, t])
  return displayErrorMessage
}

export const useCheckImage = url => {
  const isImgUrl = imgUrl => {
    return new Promise(function (resolve, reject) {
      // check whether the image exists
      var ImgObj = new Image()
      ImgObj.src = imgUrl
      ImgObj.onload = function (res) {
        resolve(res)
      }
      ImgObj.onerror = function (err) {
        reject(err)
      }
    })
  }
  const [isImg, setIsImg] = useState(null)
  useEffect(() => {
    if (!/\.(gif|jpg|jpeg|png|svg|ico|GIF|JPG|PNG|ICO)$/.test(url)) {
      return setIsImg(false)
    }
    isImgUrl(url)
      .then(() => {
        setIsImg(true)
      })
      .catch(() => {
        setIsImg(false)
      })
  }, [url])
  return isImg
}

export const useDappIcon = url => {
  const isImgUrl = useCheckImage(url)
  return isImgUrl ? url : '/images/default-dapp-icon.svg'
}

export const useLedgerBindingApi = () => {
  const {
    data: {
      network: {type, chainId},
    },
  } = useCurrentAddress()

  const ret = useMemo(() => {
    if (type === NETWORK_TYPE.CFX) {
      return new Conflux()
    }
    if (type === NETWORK_TYPE.ETH) {
      let ethInstance = new Ethereum()
      ethInstance.isAppOpen = ethInstance.isAppOpen.bind(
        ethInstance,
        chainId === '0x406' || chainId === '0x47' ? 'ESPACE' : 'ETHEREUM',
      )
      return ethInstance
    }
  }, [type, chainId])

  return ret
}
