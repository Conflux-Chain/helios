import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'

function PluginWallet() {
  const {t} = useTranslation()

  return (
    <div>
      <img src="/images/connect-hm-wallet.svg" alt="connect" />
      <div>
        <p>{t('connectLedger')}</p>
        <p>{t('connectLedgerDes')}</p>
      </div>
      <Button id="hm-btn" size="large" className="w-70">
        {t('connect')}
      </Button>
      ,
    </div>
  )
}

export default PluginWallet
