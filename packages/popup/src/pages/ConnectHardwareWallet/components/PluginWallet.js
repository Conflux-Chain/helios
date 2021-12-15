import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'

function PluginWallet() {
  const {t} = useTranslation()

  return (
    <div className="flex flex-col items-center">
      <img src="/images/connect-hm-wallet.svg" alt="connect" />
      <div className="w-110 text-center">
        <p className="text-gray-80 text-lg font-medium mb-2">
          {t('connectLedger')}
        </p>
        <p className="text-gray-60 text-sm">{t('connectLedgerDes')}</p>
      </div>
      <Button id="hm-btn" size="large" className="w-70 mt-9">
        {t('connect')}
      </Button>
    </div>
  )
}

export default PluginWallet
