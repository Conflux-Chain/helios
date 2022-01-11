import validUrl from 'valid-url'
import {useState, useEffect, useRef} from 'react'
import {isUndefined} from '@fluent-wallet/checks'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {useSWRConfig} from 'swr'
import Message from '@fluent-wallet/component-message'
import Input from '@fluent-wallet/component-input'
import Button from '@fluent-wallet/component-button'
import {COMMON_DECIMALS} from '@fluent-wallet/data-format'
import {CFX_MAINNET_CURRENCY_SYMBOL} from '@fluent-wallet/consts'
import {TitleNav, CompWithLabel, ConfirmPassword} from '../../components'
import {request, validatePasswordReg} from '../../utils'
import {useCurrentAddress} from '../../hooks/useApi'
import {ROUTES, RPC_METHODS, NETWORK_TYPE} from '../../constants'
import useLoading from '../../hooks/useLoading'
import useGlobalStore from '../../stores'

const {HOME} = ROUTES
const {
  WALLET_DETECT_NETWORK_TYPE,
  WALLET_ADD_CONFLUX_CHAIN,
  WALLET_GET_NETWORK,
  WALLET_DELETE_NETWORK,
} = RPC_METHODS
const formItems = [
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
      networkType: 'Conflux Network',
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
  // for confirm password
  const [openPasswordStatus, setOpenPasswordStatus] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('')
  const [sendingRequestStatus, setSendingRequestStatus] = useState(false)
  const isAddChain = !Object.keys(networkInfo).length
  const {data} = useCurrentAddress(isAddChain)
  const currentNetworkId = data?.network?.eid

  useEffect(() => {
    return () => {
      setNetworkInfo({})
    }
  }, [setNetworkInfo])

  const canSubmit =
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
          if (res?.chainId) {
            setNetworkError({...networkError, chainId: ''})
            setNetworkFieldValues({...networkFieldValues, chainId: res.chainId})
          } else {
            setNetworkFieldValues({...networkFieldValues, chainId: ''})
            setNetworkError({...networkError, chainId: t('unCaughtErrMsg')})
          }
        })
        .catch(err => {
          setLoading(false)
          setNetworkFieldValues({...networkFieldValues, chainId: ''})
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

  const mutateData = () => {
    mutate([WALLET_GET_NETWORK, NETWORK_TYPE.CFX]).then(() => {
      history.push(HOME)
    })
  }
  const onClickDeleteNetwork = () => {
    if (currentNetworkId === networkInfo.networkId) {
      return Message.warning({
        content: t('groupDeleteWarning'),
        top: '10px',
        duration: 1,
      })
    }
    setOpenPasswordStatus(true)
  }

  const onAddNetwork = () => {
    const {chainId, chainName, symbol, rpcUrl, blockExplorerUrl} =
      networkFieldValues
    const params = [
      {
        chainId,
        chainName,
        nativeCurrency: {
          name: symbol || CFX_MAINNET_CURRENCY_SYMBOL,
          symbol: symbol || CFX_MAINNET_CURRENCY_SYMBOL,
          decimals: COMMON_DECIMALS,
        },
        rpcUrls: [rpcUrl],
      },
    ]
    if (blockExplorerUrl) {
      params.blockExplorerUrls = [blockExplorerUrl]
    }
    request(WALLET_ADD_CONFLUX_CHAIN, params)
      .then(() => {
        mutateData()
      })
      .catch(err => {
        console.log(err)
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
  const validatePassword = value => {
    const isValid = validatePasswordReg(value)
    setPasswordErrorMessage(isValid ? '' : t('passwordRulesWarning'))
    return isValid
  }
  const onConfirmPassword = () => {
    if (
      !validatePassword(password) ||
      sendingRequestStatus ||
      isUndefined(currentNetworkId)
    ) {
      return
    }
    setSendingRequestStatus(true)
    request(WALLET_DELETE_NETWORK, {
      networkId: networkInfo.networkId,
      password,
    })
      .then(() => {
        mutateData()
      })
      .catch(e => {
        setSendingRequestStatus(false)
        setPasswordErrorMessage(
          e?.message?.indexOf?.('Invalid password') !== -1
            ? t('invalidPassword')
            : e?.message ?? t('invalidPasswordFromRpc'),
        )
      })
  }

  return (
    <div id="network-detail" className="bg-bg pb-4 h-full w-full flex flex-col">
      <TitleNav title={t('networkManagement')} />
      <div className="flex-1 overflow-y-auto no-scroll px-3 mt-1">
        {formItems.map(({labelKey, valueKey}) => (
          <CompWithLabel label={t(labelKey)} className="!mt-0" key={labelKey}>
            <Input
              width="w-full"
              readonly={
                valueKey === 'networkType' ||
                valueKey === 'chainId' ||
                !isAddChain
              }
              disabled={
                valueKey === 'networkType' ||
                valueKey === 'chainId' ||
                !isAddChain
              }
              value={networkFieldValues[valueKey]}
              onChange={e => onNetworkInputChange(e, valueKey)}
              onBlur={() => valueKey === 'rpcUrl' && onRpcInputBlur()}
              onFocus={() => valueKey === 'rpcUrl' && onRpcInputFocus()}
              errorMessage={networkError?.[valueKey] ?? ''}
              id={`change-${valueKey}-input`}
            />
          </CompWithLabel>
        ))}
      </div>
      {isAddChain && (
        <Button
          id="save-btn"
          className="mx-3"
          disabled={!canSubmit}
          onClick={onAddNetwork}
        >
          {t('save')}
        </Button>
      )}
      {networkInfo?.networkType === 'custom' && (
        <Button
          id="delete-btn"
          className="mx-3"
          onClick={onClickDeleteNetwork}
          danger={true}
        >
          {t('delete')}
        </Button>
      )}
      {networkInfo?.networkType === 'custom' && (
        <ConfirmPassword
          open={openPasswordStatus}
          onCancel={clearPasswordInfo}
          onConfirm={onConfirmPassword}
          password={password}
          passwordErrorMessage={passwordErrorMessage}
          setPassword={setPassword}
          validatePassword={validatePassword}
        />
      )}
    </div>
  )
}

export default NetworkDetail
