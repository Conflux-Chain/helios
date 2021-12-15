import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'

function ReConnectWallet() {
  const {t} = useTranslation()

  return (
    <div className="flex flex-col items-center">
      <img src="/images/connect-failed.svg" alt="connect" />
      <div className="w-110 text-center">
        <p className="text-gray-80 text-lg font-medium mb-2">
          {t('connectFailed')}
        </p>
        <p className="text-gray-60 text-sm">{t('connectLedgerTips')}</p>
      </div>
      <Button id="hm-btn" size="large" className="w-70 mt-9">
        {t('retry')}
      </Button>
    </div>
  )
}

export default ReConnectWallet
