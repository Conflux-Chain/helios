import validUrl from 'valid-url'
import {useState} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {useSWRConfig} from 'swr'
import Message from '@fluent-wallet/component-message'
import Input from '@fluent-wallet/component-input'
import Button from '@fluent-wallet/component-button'
import {COMMON_DECIMALS} from '@fluent-wallet/data-format'
import {CFX_MAINNET_CURRENCY_SYMBOL} from '@fluent-wallet/consts'
import {TitleNav, CompWithLabel} from '../../components'
import {request} from '../../utils'
import {ROUTES, RPC_METHODS, NETWORK_TYPE} from '../../constants'
import useLoading from '../../hooks/useLoading'

const {HOME} = ROUTES
const {
  WALLET_ADD_CONFLUX_CHAIN,
  WALLET_DETECT_NETWORK_TYPE,
  WALLET_GET_NETWORK,
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

function NetworkDetail() {
  const {t} = useTranslation()
  const history = useHistory()
  const {mutate} = useSWRConfig()
  const {setLoading} = useLoading()
  const [networkParams, setNetworkParams] = useState({
    chainName: '',
    rpcUrl: '',
    chainId: '',
    networkType: 'Conflux Network',
    symbol: '',
    blockExplorerUrl: '',
  })
  const [networkError, setNetworkError] = useState({
    chainName: '',
    rpcUrl: '',
    chainId: '',
    symbol: '',
    blockExplorerUrl: '',
  })
  const canSubmit =
    networkParams.chainName &&
    networkParams.rpcUrl &&
    networkParams.chainId &&
    !Object.values(networkError).some(Boolean)

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
    setNetworkParams({
      ...networkParams,
      [valueKey]: e.target.value,
    })
  }
  const onRpcInputBlur = () => {
    if (networkParams.rpcUrl && !networkError.rpcUrl) {
      setLoading(true)
      request(WALLET_DETECT_NETWORK_TYPE, {url: networkParams.rpcUrl})
        .then(res => {
          setLoading(false)
          if (res?.chainId) {
            setNetworkError({...networkError, chainId: ''})
            setNetworkParams({...networkParams, chainId: res.chainId})
          } else {
            setNetworkParams({...networkParams, chainId: ''})
            setNetworkError({...networkError, chainId: t('unCaughtErrMsg')})
          }
        })
        .catch(err => {
          setLoading(false)
          setNetworkParams({...networkParams, chainId: ''})
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

  const onSubmit = () => {
    const {chainId, chainName, symbol, rpcUrl, blockExplorerUrl} = networkParams
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
      .then(res => {
        mutate([WALLET_GET_NETWORK, NETWORK_TYPE.CFX]).then(() => {
          console.log('res', res)
          history.push(HOME)
        })
      })
      .catch(err => {
        console.log('err', err)
        Message.error({
          content:
            err?.message?.split?.('\n')?.[0] ??
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
        {formItems.map(({labelKey, valueKey}) => (
          <CompWithLabel label={t(labelKey)} className="!mt-0" key={labelKey}>
            <Input
              width="w-full"
              isChainId={valueKey === 'chainId'}
              readonly={valueKey === 'networkType' || valueKey === 'chainId'}
              disabled={valueKey === 'networkType' || valueKey === 'chainId'}
              value={networkParams[valueKey]}
              onChange={e => onNetworkInputChange(e, valueKey)}
              onBlur={() => valueKey === 'rpcUrl' && onRpcInputBlur()}
              errorMessage={networkError?.[valueKey] ?? ''}
              id={`change-${valueKey}-input`}
            />
          </CompWithLabel>
        ))}
      </div>
      <Button
        id="save-btn"
        className="mx-3"
        disabled={!canSubmit}
        onClick={onSubmit}
      >
        {t('save')}
      </Button>
    </div>
  )
}

export default NetworkDetail
