import {useTranslation} from 'react-i18next'
import {TitleNav, CompWithLabel} from '../../components'
import Input from '@fluent-wallet/component-input'
import {useState} from 'react'

const formItems = [
  {labelKey: 'networkName', value: 'chainName', readOnly: false},
  {labelKey: 'newRpcUrl', value: 'rpcUrls', readOnly: false},
  {labelKey: 'chainId', value: 'chainId', readOnly: false},
  {labelKey: 'networkType', value: 'networkType', readOnly: true},
  {labelKey: 'currencySymbol', value: 'symbol', readOnly: false},
  {labelKey: 'blockExplorerUrl', value: 'blockExplorerUrls', readOnly: false},
]
function NetworkDetail() {
  const {t} = useTranslation()
  // TODO: global store
  const [networkParams, setNetworkParams] = useState({
    chainName: '',
    rpcUrls: '',
    chainId: '',
    networkType: 'Conflux Network',
    symbol: '',
    blockExplorerUrls: '',
  })

  return (
    <div id="network-detail" className="bg-bg pb-8 h-full w-full flex flex-col">
      <TitleNav title={t('networkManagement')} />
      <div className="flex-1 overflow-y-auto no-scroll px-3 mt-1">
        {formItems.map(({labelKey, value, readOnly}) => (
          <CompWithLabel label={t(labelKey)} className="!mt-0" key={labelKey}>
            <Input
              width="w-full"
              readOnly={readOnly}
              disabled={readOnly}
              value={networkParams[value]}
              placeholder={t('toAddressPlaceholder')}
              onChange={e =>
                !readOnly &&
                setNetworkParams({
                  ...networkParams,
                  ...{[value]: e.target.value},
                })
              }
              // errorMessage={errorMessage}
              id={`change-${value}-input`}
            />
          </CompWithLabel>
        ))}
      </div>
    </div>
  )
}

export default NetworkDetail
