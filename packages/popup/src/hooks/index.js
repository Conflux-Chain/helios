import {useEffect, useState, useMemo, useCallback} from 'react'
import {isArray} from '@fluent-wallet/checks'
import useSWR from 'swr'
import i18next from 'i18next'
import {useTranslation} from 'react-i18next'
import create from 'zustand'
import {useAsync, useDebounce} from 'react-use'
import {useRPCProvider} from '@fluent-wallet/use-rpc'
import {estimate} from '@fluent-wallet/estimate-tx'
import {iface} from '@fluent-wallet/contract-abis/777.js'
import {decode, validateBase32Address} from '@fluent-wallet/base32-address'
import {Conflux, Ethereum} from '@fluent-wallet/ledger'
import {
  COMMON_DECIMALS,
  convertValueToData,
  convertDecimal,
  convertDataToValue,
} from '@fluent-wallet/data-format'
import {
  getCFXContractMethodSignature,
  getEthContractMethodSignature,
} from '@fluent-wallet/contract-method-name'
import useGlobalStore from '../stores'
import {useHistory, useLocation} from 'react-router-dom'
import {consts} from '@fluent-wallet/ledger'
import {ETH_TX_TYPES} from '@fluent-wallet/consts'
import {ROUTES, ANIMATE_DURING_TIME, NETWORK_TYPE} from '../constants'
import {
  useSingleTokenInfoWithNativeTokenSupport,
  useDataForPopup,
  useCurrentAddress,
  useAddress,
  useBalance,
  useNetworkTypeIsCfx,
  useAddressType,
  useValid20Token,
  usePendingAuthReq,
  useNetwork1559Compatible,
} from './useApi'
import {
  validateAddress,
  validateByEip55,
  isValidDomainName,
  getSingleAddressWithNameService,
  getSingleServiceNameWithAddress,
  getServiceNamesWithAddresses,
} from '../utils'

const {HOME} = ROUTES
const {LEDGER_APP_NAME} = consts

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
  const {
    from,
    to,
    value,
    data,
    nonce,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gas,
    storageLimit,
  } = tx
  const nativeBalance =
    useBalance(from, network?.eid, '0x0')?.[from]?.['0x0'] || '0x0'
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
    maxFeePerGas,
    maxPriorityFeePerGas,
    gas,
    storageLimit,
    network.chainId,
    network.gasBuffer,
    // currentNetwork.netId,
    Boolean(provider),
    Object.keys(tokensAmount)?.[0],
    nativeBalance,
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

const initAdvancedGasSetting = {
  gasLimit: '',
  storageLimit: '',
  gasPrice: '',
  maxFeePerGas: '',
  maxPriorityFeePerGas: '',
  nonce: '',
  gasLevel: '',
}

const defaultSendTransactionParams = {
  toAddress: '',
  sendAmount: '',
  gasPrice: '',
  maxFeePerGas: '',
  maxPriorityFeePerGas: '',
  gasLimit: '',
  storageLimit: '',
  gasLevel: 'medium',
  advancedGasSetting: initAdvancedGasSetting,
  data: '',
  nonce: '',
  sendTokenId: 'native',
  customAllowance: '',
  tx: {},
  maxMode: false,
}

export const useCurrentTxStore = create((set, get) => ({
  ...defaultSendTransactionParams,

  setTx: tx => set({tx}),
  setData: data => set({data}),
  setToAddress: toAddress => set({toAddress}),
  setSendAmount: sendAmount => set({sendAmount}),
  setGasPrice: gasPrice => set({gasPrice}),
  setMaxFeePerGas: maxFeePerGas => set({maxFeePerGas}),
  setMaxPriorityFeePerGas: maxPriorityFeePerGas => set({maxPriorityFeePerGas}),
  setGasLimit: gasLimit => set({gasLimit}),
  setStorageLimit: storageLimit => set({storageLimit}),
  setGasLevel: gasLevel => set({gasLevel}),
  setMaxMode: maxMode => set({maxMode}),
  setAdvancedGasSetting: advancedGasSetting => {
    const oldSetting = get().advancedGasSetting
    const newSetting = {...oldSetting, ...advancedGasSetting}
    set({advancedGasSetting: newSetting})
  },
  clearAdvancedGasSetting: () =>
    set({advancedGasSetting: initAdvancedGasSetting}),
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
  if (isNativeToken) {
    to = isValid ? toAddress : address
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

export const useEstimateError = (
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
        return (
          t('contractError') + error?.message?.split?.('\n')?.[0] ??
          error?.message ??
          error
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

export const useDecodeData = ({to, data: rawData} = {}) => {
  const data = padHexData(rawData)
  const [decodeData, setDecodeData] = useState({})
  const [isDecoding, setIsDecoding] = useState(false)
  const type = useAddressType(to)
  const {
    data: {
      network: {netId, type: currentNetworkType},
    },
  } = useCurrentAddress()

  const isContract = type === 'contract' || type === 'builtin'
  const isOutContract = type === 'contract'
  const isEOAAddress = !isContract && !!type
  const crc20Token = useValid20Token(isOutContract ? to : '')

  useEffect(() => {
    if (!!data && data !== '0x') {
      if (!currentNetworkType) {
        setDecodeData({})
        setIsDecoding(false)
        return
      }
      const getSignature =
        currentNetworkType === NETWORK_TYPE.CFX
          ? getCFXContractMethodSignature
          : getEthContractMethodSignature
      const params = [to, data, netId]
      const offlineParams = [...params, true]
      if (isContract) {
        setIsDecoding(true)
      }

      getSignature(...(isContract ? params : offlineParams))
        .then(result => {
          setDecodeData({...result})
          setIsDecoding(false)
        })
        .catch(e => {
          console.error('getSignature error:', e)
          setIsDecoding(false)
        })
      return
    }
    setDecodeData({})
    setIsDecoding(false)
  }, [data, isContract, to, netId, currentNetworkType])

  return {
    isContract,
    isEOAAddress,
    token: crc20Token,
    decodeData,
    data,
    isDecoding,
  }
}

export const useDecodeDisplay = ({
  deps,
  isDapp,
  isContract,
  isEOAAddress,
  nativeToken,
  pendingAuthReq = {},
  tx = {},
  decodeData: passedDecodeData,
  token: passedToken,
}) => {
  let displayToken = {},
    displayValue = '',
    displayAccount,
    displayToAddress,
    displayFromAddress
  const {from, to, value} = tx
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
  const token = passedToken
  const decodeData = passedDecodeData

  const isApproveToken =
    isDapp &&
    isContract &&
    decodeData?.name === 'approve' &&
    (!value || value === '0x' || value === '0x0')
  const isSendNativeToken = !!to && isEOAAddress
  const args = decodeData?.args || []
  const methodName = decodeData?.name || ''
  const isSendToken =
    !isDapp ||
    isSendNativeToken ||
    (isDapp &&
      isContract &&
      (!value || value === '0x' || value === '0x0') &&
      ((methodName === 'transferFrom' &&
        args?.[0]?.toLowerCase() === address?.toLowerCase()) ||
        methodName === 'transfer'))

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
      displayValue = convertDataToValue(
        !!value && value !== '0x' ? value : '0x0',
        nativeToken?.decimals,
      )
    } else {
      if (token?.symbol) displayToken = token
      if (isSendToken) {
        displayFromAddress =
          methodName === 'transferFrom'
            ? args?.[0]
            : methodName === 'transfer'
            ? address
            : ''
        displayToAddress =
          methodName === 'transferFrom'
            ? args?.[1]
            : methodName === 'transfer'
            ? args?.[0]
            : ''
        displayValue = convertDecimal(
          methodName === 'transferFrom'
            ? args[2].toString(10)
            : methodName === 'transfer'
            ? args[1].toString(10)
            : '0',
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
    isSendNativeToken,
    displayFromAddress,
    displayToAddress,
    displayAccount,
    displayValue,
    displayToken,
  }
}

export function padHexData(data) {
  if (typeof data !== 'string') return data
  let hex = data.startsWith('0x') ? data.slice(2) : data
  if (hex.length % 2 === 1) hex = '0' + hex
  return '0x' + hex
}

export const useViewData = (
  {data} = {},
  isApproveToken,
  passedDecodeData,
  passedToken,
) => {
  const {customAllowance} = useCurrentTxParams()
  const allowance =
    convertValueToData(customAllowance, passedToken?.decimals) || '0x0'
  const firstArg = passedDecodeData?.args?.[0]
  const spender =
    isApproveToken && firstArg
      ? validateBase32Address(firstArg)
        ? decode(firstArg).hexAddress
        : firstArg
      : ''
  const viewData = useMemo(() => {
    const shouldUseCustom = customAllowance && isApproveToken
    if (shouldUseCustom) {
      if (!spender) {
        return data
      }
      return iface.encodeFunctionData('approve', [spender, allowance])
    } else {
      return padHexData(data)
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

export const useLedgerAppName = () => {
  const {
    data: {
      network: {type: networkType},
    },
  } = useCurrentAddress()

  return networkType == NETWORK_TYPE.CFX
    ? LEDGER_APP_NAME.CONFLUX
    : networkType == NETWORK_TYPE.ETH
    ? LEDGER_APP_NAME.ETHEREUM
    : ''
}

export const useIsTxTreatedAsEIP1559 = txType => {
  const network1559Compatible = useNetwork1559Compatible()
  return network1559Compatible && (!txType || txType === ETH_TX_TYPES.EIP1559)
}

export const useInputAddressInfo = ({
  netId,
  inputAddress,
  type,
  isInputAddr,
  cb,
}) => {
  const {t} = useTranslation()
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const [validateRet, setValidateRet] = useState(() => ({
    address: '',
    nsName: '',
    error: '',
  }))

  const [loading, setLoading] = useState(false)

  const setWrongMessage = useCallback(
    errMsg => {
      setValidateRet({
        address: inputAddress,
        nsName: '',
        error:
          errMsg || networkTypeIsCfx
            ? t('invalidAddress')
            : t('invalidHexAddress'),
      })
    },
    [inputAddress, networkTypeIsCfx, t],
  )

  const onRequestNsAddress = useCallback(async () => {
    let nsRet
    try {
      setLoading(true)
      nsRet = await getSingleAddressWithNameService({
        type,
        netId,
        provider: window?.___CFXJS_USE_RPC__PRIVIDER,
        name: inputAddress,
      })
      setLoading(false)
      if (nsRet) {
        setValidateRet({
          error: '',
          address: nsRet,
          nsName: inputAddress,
        })
      } else {
        setWrongMessage()
      }
    } catch (err) {
      setLoading(false)
      setWrongMessage()
    }
    return nsRet
  }, [inputAddress, netId, setWrongMessage, type])

  const onRequestNsName = useCallback(async () => {
    let nsRet
    try {
      setLoading(true)
      nsRet = await getSingleServiceNameWithAddress({
        type,
        netId,
        provider: window?.___CFXJS_USE_RPC__PRIVIDER,
        address: inputAddress,
      })
      setLoading(false)
      setValidateRet({error: '', address: inputAddress, nsName: nsRet || ''})
    } catch (err) {
      setValidateRet({error: '', address: inputAddress, nsName: ''})
      setLoading(false)
    }
    return nsRet
  }, [inputAddress, netId, type])

  useDebounce(
    async () => {
      if (!inputAddress && !isInputAddr) {
        return
      }
      // get ns name
      if (isValidDomainName(inputAddress) && type) {
        const ret = await onRequestNsAddress()
        return cb?.({ret, type: 'address'})
      }
      // wrong address
      if (!validateAddress(inputAddress, networkTypeIsCfx, netId)) {
        return setWrongMessage()
      }
      // wrong checkSum
      if (!networkTypeIsCfx && !validateByEip55(inputAddress)) {
        return setWrongMessage(t('unChecksumAddress'))
      }
      //correct address
      setValidateRet({
        address: inputAddress,
        nsName: '',
        error: '',
      })
      // get ns name
      const ret = await onRequestNsName()
      return cb?.({ret, type: 'nsName'})
    },
    300,
    [inputAddress],
  )

  return {
    ...validateRet,
    loading,
  }
}

export const useServiceName = (
  {type, netId, provider, address, notSend = false},
  opts,
) => {
  return useSWR(
    type && provider && address && !notSend ? [type, netId, address] : null,
    () =>
      getSingleServiceNameWithAddress({
        type,
        netId,
        provider,
        address,
      }),
    opts,
  )
}

export const useServiceNames = (
  {type, netId, provider, addressArr, notSend = false},
  opts,
) => {
  return useSWR(
    type && provider && isArray(addressArr) && addressArr?.length && !notSend
      ? [type, netId, [...addressArr]]
      : null,
    () =>
      getServiceNamesWithAddresses({
        type,
        netId,
        provider,
        addressArr: [...addressArr],
      }),
    opts,
  )
}

export const useAddressWithServiceName = (
  {type, netId, provider, name, notSend = false},
  opts,
) => {
  return useSWR(
    type && provider && name && !notSend ? [type, netId, name] : null,
    () =>
      getSingleAddressWithNameService({
        type,
        netId,
        provider: window?.___CFXJS_USE_RPC__PRIVIDER,
        name,
      }),
    opts,
  )
}
