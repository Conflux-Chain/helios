import validUrl from 'valid-url'
import {useState, useEffect, useRef} from 'react'
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
import {request} from '../../utils'
import {useCurrentAddress} from '../../hooks/useApi'
import {ROUTES, RPC_METHODS, NETWORK_TYPE} from '../../constants'
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

function NetworkDetail() {
  const {t} = useTranslation()
  const history = useHistory()
  const {mutate} = useSWRConfig()
  const {setLoading} = useLoading()
  const rpcUrlRef = useRef(null)
  const {networkInfo, setNetworkInfo} = useGlobalStore()
  const [networkFieldValues, setNetworkFieldValues] = useState(() => {
    return {
      chainName: networkInfo?.networkName ?? '',
      rpcUrl: networkInfo?.rpcUrl ?? '',
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
  const isAddingChain = !Object.keys(networkInfo).length
  const {data} = useCurrentAddress(isAddingChain)
  const currentNetworkId = data?.network?.eid

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

  const onNetworkInputChange = (e, valueKey) => {
    validateInputValue(e.target.value, valueKey)
    setNetworkFieldValues({
      ...networkFieldValues,
      [valueKey]: e.target.value,
    })
  }

  const onRpcInputFocus = () => {
    rpcUrlRef.current = networkFieldValues.rpcUrl
  }

  const onRpcInputBlur = () => {
    if (
      networkFieldValues.rpcUrl &&
      !networkError.rpcUrl &&
      (rpcUrlRef.current !== networkFieldValues.rpcUrl ||
        !networkFieldValues.chainId)
    ) {
      setLoading(true)
      request(WALLET_DETECT_NETWORK_TYPE, {url: networkFieldValues.rpcUrl})
        .then(res => {
          setLoading(false)
          if (res?.chainId && res?.type) {
            setDetectedChainType(res.type)
            setNetworkError({...networkError, chainId: ''})
            setNetworkFieldValues({
              ...networkFieldValues,
              chainId: res.chainId,
              networkType: getNetworkType(res.type),
            })
          } else {
            setNetworkFieldValues({
              ...networkFieldValues,
              chainId: '',
              networkType: '',
            })
            setNetworkError({...networkError, chainId: t('unCaughtErrMsg')})
          }
        })
        .catch(err => {
          setLoading(false)
          setNetworkFieldValues({
            ...networkFieldValues,
            chainId: '',
            networkType: '',
          })
          if (err?.message?.indexOf?.('InvalidParams') !== -1) {
            return setNetworkError({...networkError, chainId: t('wrongRpcUrl')})
          }
          setNetworkError({
            ...networkError,
            chainId:
              err?.message?.split?.('\n')?.[0] ??
              err?.message ??
              t('unCaughtErrMsg'),
          })
        })
    }
  }

  const mutateData = () =>
    mutate([WALLET_GET_NETWORK]).then(() => {
      history.push(HOME)
    })

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

  const onSave = (type = 'add') => {
    const {chainId, chainName, symbol, rpcUrl, blockExplorerUrl} =
      networkFieldValues

    if (type === 'innerEdit' && rpcUrl === networkInfo?.rpcUrl) {
      return history.push(HOME)
    }

    const param = {
      chainId,
      chainName,
      nativeCurrency: {
        name: symbol || detectedChainType.toUpperCase(),
        symbol: symbol || detectedChainType.toUpperCase(),
        decimals: COMMON_DECIMALS,
      },
      rpcUrls: [rpcUrl],
    }

    if (blockExplorerUrl) {
      param.blockExplorerUrls = [blockExplorerUrl]
    }

    if (type !== 'add') {
      param.networkId = networkInfo.networkId
    }
    setLoading(true)
    request(
      type !== 'add'
        ? WALLET_UPDATE_NETWORK
        : detectedChainType === NETWORK_TYPE.CFX
        ? WALLET_ADD_CONFLUX_CHAIN
        : WALLET_ADD_ETHEREUM_CHAIN,
      type !== 'add' ? param : [param],
    )
      .then(() => {
        setLoading(false)
        mutateData()
      })
      .catch(err => {
        setLoading(false)
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
      })
  }

  return (
    <div id="network-detail" className="bg-bg pb-4 h-full w-full flex flex-col">
      <TitleNav title={t('networkManagement')} />
      <div className="flex-1 overflow-y-auto no-scroll px-3 mt-1">
        {FORM_ITEMS.map(({labelKey, valueKey}) => (
          <CompWithLabel
            label={t(labelKey)}
            key={labelKey}
            className="!mt-2"
            labelClassName="!text-gray-40 !mb-1"
          >
            <Input
              width="w-full"
              readOnly={
                valueKey === 'networkType' ||
                valueKey === 'chainId' ||
                (!isAddingChain &&
                  networkInfo?.networkType !== 'custom' &&
                  valueKey !== 'rpcUrl')
              }
              disabled={
                valueKey === 'networkType' ||
                valueKey === 'chainId' ||
                (!isAddingChain &&
                  networkInfo?.networkType !== 'custom' &&
                  valueKey !== 'rpcUrl')
              }
              value={
                valueKey === 'chainId'
                  ? formatHexToDecimal(networkFieldValues[valueKey])
                  : networkFieldValues[valueKey]
              }
              onChange={e => onNetworkInputChange(e, valueKey)}
              onBlur={() => valueKey === 'rpcUrl' && onRpcInputBlur()}
              onFocus={() => valueKey === 'rpcUrl' && onRpcInputFocus()}
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

      {(isAddingChain || networkInfo?.networkType !== 'custom') && (
        <Button
          id="save-network-btn"
          className="mx-3"
          disabled={!canSave}
          onClick={() => onSave(isAddingChain ? 'add' : 'innerEdit')}
        >
          {t('save')}
        </Button>
      )}

      {networkInfo?.networkType === 'custom' && (
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
              onClick={() => onSave('customEdit')}
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
              onConfirmCallback={() => mutateData()}
              confirmParams={{networkId: networkInfo.networkId, password}}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default NetworkDetail
