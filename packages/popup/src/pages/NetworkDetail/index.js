import validUrl from 'valid-url'
import {useState, useEffect, useRef, useMemo} from 'react'
import {isUndefined} from '@fluent-wallet/checks'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {useSWRConfig} from 'swr'
import Message from '@fluent-wallet/component-message'
import Input from '@fluent-wallet/component-input'
import Button from '@fluent-wallet/component-button'
import {COMMON_DECIMALS, formatHexToDecimal} from '@fluent-wallet/data-format'
import {
  CFX_MAINNET_CURRENCY_NAME,
  ETH_MAINNET_CURRENCY_NAME,
} from '@fluent-wallet/consts'
import {TitleNav, CompWithLabel, ConfirmPassword} from '../../components'
import {request, getInnerUrlWithoutLimitKey} from '../../utils'
import {useCurrentAddress} from '../../hooks/useApi'
import {
  ROUTES,
  RPC_METHODS,
  NETWORK_TYPE,
  BUILTIN_NETWORK_ENDPOINTS,
} from '../../constants'
import useLoading from '../../hooks/useLoading'
import useGlobalStore from '../../stores'

const {HOME} = ROUTES
const {
  WALLET_DETECT_NETWORK_TYPE,
  WALLET_ADD_ETHEREUM_CHAIN,
  WALLET_ADD_CONFLUX_CHAIN,
  WALLET_GET_NETWORK,
  WALLET_DELETE_NETWORK,
  WALLET_UPDATE_NETWORK,
} = RPC_METHODS
const FORM_ITEMS = [
  {labelKey: 'networkName', valueKey: 'chainName'},
  {labelKey: 'newRpcUrl', valueKey: 'rpcUrl'},
  {labelKey: 'chainId', valueKey: 'chainId'},
  {labelKey: 'networkType', valueKey: 'networkType'},
  {labelKey: 'currencySymbol', valueKey: 'symbol'},
  {
    labelKey: 'blockExplorerUrl',
    valueKey: 'blockExplorerUrl',
  },
]

const addUrlPrefix = url => {
  if (url && url.indexOf('http') !== 0) {
    return `https://${url}`
  }
  return url || ''
}

const getNetworkType = type => {
  if (!type) {
    return ''
  }
  return `${
    type === NETWORK_TYPE.CFX
      ? CFX_MAINNET_CURRENCY_NAME
      : ETH_MAINNET_CURRENCY_NAME
  } Network`
}

const getInputDisabledStatus = (valueKey, isBuiltin) => {
  return (
    valueKey === 'networkType' ||
    valueKey === 'chainId' ||
    (isBuiltin && valueKey !== 'rpcUrl')
  )
}

function NetworkDetail() {
  const {t} = useTranslation()
  const history = useHistory()
  const {mutate} = useSWRConfig()
  const {setLoading} = useLoading()
  const storageRpcUrlRef = useRef(null)
  const rpcUrlInputRef = useRef(null)

  const {networkInfo, setNetworkInfo} = useGlobalStore()

  const isAddingChain = !Object.keys(networkInfo).length
  const isCustom = networkInfo?.networkType === 'custom'
  const isBuiltin = !isAddingChain && !isCustom
  const defaultOrigin = useMemo(() => {
    return getInnerUrlWithoutLimitKey(networkInfo?.networkName)
  }, [networkInfo?.networkName])

  const [networkFieldValues, setNetworkFieldValues] = useState(() => {
    return {
      chainName: networkInfo?.networkName ?? '',
      rpcUrl: networkInfo?.rpcUrl
        ? networkInfo.rpcUrl ===
          BUILTIN_NETWORK_ENDPOINTS?.[networkInfo?.networkName]
          ? defaultOrigin
          : networkInfo.rpcUrl
        : '',
      chainId: networkInfo?.chainId ?? '',
      networkType: getNetworkType(networkInfo?.type),
      symbol: networkInfo?.symbol ?? '',
      blockExplorerUrl: addUrlPrefix(networkInfo?.blockExplorerUrl),
    }
  })
  const [networkError, setNetworkError] = useState({
    chainName: '',
    rpcUrl: '',
    chainId: '',
    symbol: '',
    blockExplorerUrl: '',
  })
  const [openPasswordStatus, setOpenPasswordStatus] = useState(false)
  const [password, setPassword] = useState('')
  const [detectedChainType, setDetectedChainType] = useState('')
  const [rpcUrlChecked, setRpcUrlChecked] = useState(false)
  const [rpcUrlResetAble, setRpcUrlResetAble] = useState(false)

  const {data} = useCurrentAddress(isAddingChain)
  const currentNetworkId = data?.network?.eid

  useEffect(() => {
    setRpcUrlResetAble(isBuiltin && networkFieldValues.rpcUrl !== defaultOrigin)
  }, [isBuiltin, defaultOrigin, networkFieldValues.rpcUrl])

  useEffect(() => {
    return () => {
      setNetworkInfo({})
    }
  }, [setNetworkInfo])

  const canSave =
    networkFieldValues.chainName &&
    networkFieldValues.rpcUrl &&
    networkFieldValues.chainId &&
    !Object.values(networkError).some(Boolean)

  const clearPasswordInfo = () => {
    setPassword('')
    setOpenPasswordStatus(false)
  }

  const validateInputValue = (value, valueKey) => {
    let errMsg = ''
    if (!value) {
      if (valueKey !== 'symbol' && valueKey !== 'blockExplorerUrl') {
        errMsg = t('notFilled')
      }
    } else if (valueKey === 'rpcUrl' || valueKey === 'blockExplorerUrl') {
      if (!new RegExp(/^((http|https):\/\/)/).test(value)) {
        errMsg = t('urlWarning')
      } else if (!validUrl.isWebUri(value)) {
        errMsg = t('invalidRpcUrl')
      }
    }
    return setNetworkError({...networkError, [valueKey]: errMsg})
  }

  const onNetworkInputChange = (value, valueKey) => {
    validateInputValue(value, valueKey)
    setNetworkFieldValues({
      ...networkFieldValues,
      [valueKey]: value,
    })
  }

  const onRpcInputFocus = () => {
    setRpcUrlChecked(false)
    storageRpcUrlRef.current = networkFieldValues.rpcUrl
  }

  const onValidateRpcUrl = async () => {
    try {
      const res = await request(WALLET_DETECT_NETWORK_TYPE, {
        url:
          networkFieldValues.rpcUrl === defaultOrigin ||
          networkFieldValues.rpcUrl === `${defaultOrigin}/`
            ? BUILTIN_NETWORK_ENDPOINTS?.[networkInfo?.networkName]
            : networkFieldValues.rpcUrl,
      })
      // validated url
      if (res?.chainId && res?.type) {
        setDetectedChainType(res.type)
        setNetworkError({...networkError, chainId: ''})
        setNetworkFieldValues({
          ...networkFieldValues,
          chainId: res.chainId,
          networkType: getNetworkType(res.type),
        })
        return res.chainId
      }

      // invalidated url
      setNetworkFieldValues({
        ...networkFieldValues,
        chainId: '',
        networkType: '',
      })
      setNetworkError({...networkError, chainId: t('unCaughtErrMsg')})
      return false
    } catch (err) {
      // invalidated url or other error
      setNetworkFieldValues({
        ...networkFieldValues,
        chainId: '',
        networkType: '',
      })

      const chainIdError =
        err?.message?.indexOf?.('InvalidParams') !== -1
          ? t('wrongRpcUrl')
          : err?.message?.split?.('\n')?.[0] ??
            err?.message ??
            t('unCaughtErrMsg')

      setNetworkError({...networkError, chainId: chainIdError})
      return false
    }
  }

  const onRpcInputBlur = async () => {
    if (
      networkFieldValues.rpcUrl &&
      !networkError.rpcUrl &&
      (storageRpcUrlRef.current !== networkFieldValues.rpcUrl ||
        !networkFieldValues.chainId ||
        (isBuiltin && rpcUrlResetAble))
    ) {
      setLoading(true)
      await onValidateRpcUrl()
      setLoading(false)
    }
    setRpcUrlChecked(true)
  }

  const mutateData = async () => {
    await mutate([WALLET_GET_NETWORK])
    history.push(HOME)
  }

  const onClickDeleteNetwork = () => {
    if (currentNetworkId === networkInfo.networkId) {
      return Message.warning({
        content: t('networkDeleteWarning'),
        top: '10px',
        duration: 1,
      })
    }
    setOpenPasswordStatus(true)
  }

  const onSendUpdateNetworkRequest = async (param, rpcMethod) => {
    try {
      await request(rpcMethod, param)
      return true
    } catch (err) {
      Message.error({
        content:
          err?.message?.indexOf?.('Duplicate network endpoint') !== -1
            ? t('duplicateNetworkEndpoint')
            : err?.message?.split?.('\n')?.[0] ??
              err?.message ??
              t('unCaughtErrMsg'),
        top: '10px',
        duration: 1,
      })
      return false
    }
  }

  const onSave = async (type = 'add') => {
    const {chainId, chainName, symbol, rpcUrl, blockExplorerUrl} =
      networkFieldValues
    if (
      type === 'innerEdit' &&
      (rpcUrl === networkInfo?.rpcUrl ||
        rpcUrl === defaultOrigin ||
        rpcUrl === `${defaultOrigin}/`)
    ) {
      return history.push(HOME)
    }
    setLoading(true)
    // check rpc url again when pasting a rpc url directly
    let doubleCheckedChainId
    if (!rpcUrlChecked) {
      doubleCheckedChainId = await onValidateRpcUrl()
      setRpcUrlChecked(true)
      if (!doubleCheckedChainId) {
        setLoading(false)
        return
      }
    }

    const param = {
      chainId: doubleCheckedChainId || chainId,
      chainName,
      nativeCurrency: {
        name: symbol || detectedChainType.toUpperCase(),
        symbol: symbol || detectedChainType.toUpperCase(),
        decimals: COMMON_DECIMALS,
      },
      rpcUrls: [
        rpcUrl === defaultOrigin || rpcUrl === `${defaultOrigin}/`
          ? BUILTIN_NETWORK_ENDPOINTS?.[networkInfo?.networkName]
          : rpcUrl,
      ],
    }

    if (blockExplorerUrl) {
      param.blockExplorerUrls = [blockExplorerUrl]
    }

    if (type !== 'add') {
      param.networkId = networkInfo.networkId
    }

    const sendingRet = await onSendUpdateNetworkRequest(
      type !== 'add' ? param : [param],
      type !== 'add'
        ? WALLET_UPDATE_NETWORK
        : detectedChainType === NETWORK_TYPE.CFX
        ? WALLET_ADD_CONFLUX_CHAIN
        : WALLET_ADD_ETHEREUM_CHAIN,
    )
    setLoading(false)
    sendingRet && mutateData()
  }

  return (
    <div id="network-detail" className="bg-bg pb-4 h-full w-full flex flex-col">
      <TitleNav title={t('networkManagement')} />
      <div className="flex-1 overflow-y-auto no-scroll px-3 mt-1">
        {FORM_ITEMS.map(({labelKey, valueKey}) => (
          <CompWithLabel
            label={
              <span className="flex justify-between items-center">
                <span>{t(labelKey)}</span>
                {/* reset builtin network urls into default */}
                {valueKey === 'rpcUrl' && rpcUrlResetAble && (
                  <span
                    aria-hidden="true"
                    className="text-xs text-primary cursor-pointer"
                    onMouseDown={e => {
                      e.preventDefault()
                      onNetworkInputChange(defaultOrigin, 'rpcUrl')
                      rpcUrlInputRef?.current?.focus()
                    }}
                  >
                    {t('resetDefaultRpcUrl')}
                  </span>
                )}
              </span>
            }
            key={labelKey}
            className="!mt-2"
            labelClassName="!text-gray-40 !mb-1"
          >
            <Input
              width="w-full"
              readOnly={getInputDisabledStatus(valueKey, isBuiltin)}
              disabled={getInputDisabledStatus(valueKey, isBuiltin)}
              value={
                valueKey === 'chainId'
                  ? formatHexToDecimal(networkFieldValues[valueKey])
                  : networkFieldValues[valueKey]
              }
              onChange={e => onNetworkInputChange(e.target.value, valueKey)}
              onBlur={() => valueKey === 'rpcUrl' && onRpcInputBlur()}
              onFocus={() => valueKey === 'rpcUrl' && onRpcInputFocus()}
              ref={valueKey === 'rpcUrl' ? rpcUrlInputRef : null}
              errorMessage={
                networkFieldValues[valueKey] || valueKey === 'chainId'
                  ? networkError?.[valueKey] ?? ''
                  : ''
              }
              placeholder={
                valueKey === 'symbol' ? detectedChainType.toUpperCase() : ''
              }
              id={`change-${valueKey}-input`}
            />
          </CompWithLabel>
        ))}
      </div>

      {(isAddingChain || isBuiltin) && (
        <Button
          id="save-network-btn"
          className="mx-3"
          disabled={!canSave}
          onMouseDown={e => {
            e.preventDefault()
            onSave(isAddingChain ? 'add' : 'innerEdit')
          }}
        >
          {t('save')}
        </Button>
      )}

      {isCustom && (
        <div>
          <div className="mx-3 flex">
            <Button
              id="delete-btn"
              className="flex-1 mr-3"
              variant="outlined"
              onClick={onClickDeleteNetwork}
              danger={true}
            >
              {t('delete')}
            </Button>
            <Button
              id="edit-btn"
              className="flex-1"
              disabled={!canSave}
              onMouseDown={e => {
                e.preventDefault()
                onSave('customEdit')
              }}
            >
              {t('save')}
            </Button>
          </div>
          {!isUndefined(currentNetworkId) && (
            <ConfirmPassword
              open={openPasswordStatus}
              onCancel={clearPasswordInfo}
              password={password}
              setPassword={setPassword}
              rpcMethod={WALLET_DELETE_NETWORK}
              onConfirmCallback={mutateData}
              confirmParams={{networkId: networkInfo.networkId, password}}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default NetworkDetail
