import PropTypes from 'prop-types'
import validUrl from 'valid-url'
import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import Input from '@fluent-wallet/component-input'
import Button from '@fluent-wallet/component-button'
import {formatDecimalToHex, COMMON_DECIMALS} from '@fluent-wallet/data-format'
import {CFX_MAINNET_CURRENCY_SYMBOL} from '@fluent-wallet/consts'
import {TitleNav, CompWithLabel, NumberInput} from '../../components'
import {request} from '../../utils'
import {RPC_METHODS} from '../../constants'

const {WALLET_ADD_CONFLUX_CHAIN} = RPC_METHODS
const formItems = [
  {labelKey: 'networkName', valueKey: 'chainName', readOnly: false},
  {labelKey: 'newRpcUrl', valueKey: 'rpcUrl', readOnly: false},
  {labelKey: 'chainId', valueKey: 'chainId', readOnly: false},
  {labelKey: 'networkType', valueKey: 'networkType', readOnly: true},
  {labelKey: 'currencySymbol', valueKey: 'symbol', readOnly: false},
  {
    labelKey: 'blockExplorerUrl',
    valueKey: 'blockExplorerUrl',
    readOnly: false,
  },
]

function NetworkInput({isChainId, ...props}) {
  return isChainId ? <NumberInput {...props} /> : <Input {...props} />
}

NetworkInput.propTypes = {
  isChainId: PropTypes.bool,
}

function NetworkDetail() {
  const {t} = useTranslation()
  // TODO: global store
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
    return setNetworkError({...networkError, ...{[valueKey]: errMsg}})
  }

  const onNetworkInputChange = (e, valueKey) => {
    validateInputValue(e.target.value, valueKey)
    setNetworkParams({
      ...networkParams,
      ...{[valueKey]: e.target.value},
    })
  }

  const onSubmit = () => {
    const {chainId, chainName, symbol, rpcUrl, blockExplorerUrl} = networkParams
    const params = [
      {
        chainId: formatDecimalToHex(chainId),
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
        console.log('res', res)
      })
      .catch(err => {
        console.log(err)
      })
  }

  return (
    <div id="network-detail" className="bg-bg pb-4 h-full w-full flex flex-col">
      <TitleNav title={t('networkManagement')} />
      <div className="flex-1 overflow-y-auto no-scroll px-3 mt-1">
        {formItems.map(({labelKey, valueKey, readOnly}) => (
          <CompWithLabel label={t(labelKey)} className="!mt-0" key={labelKey}>
            <NetworkInput
              width="w-full"
              isChainId={valueKey === 'chainId'}
              readOnly={readOnly}
              disabled={readOnly}
              value={networkParams[valueKey]}
              onChange={e => !readOnly && onNetworkInputChange(e, valueKey)}
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
