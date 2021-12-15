import {useTranslation} from 'react-i18next'

function ReConnectWallet() {
  const {t} = useTranslation()

  return (
    <div>
      <img src="/images/connect-hm-wallet.svg" alt="searching" />
      <div>
        <p>{t('searchHmWallet')}</p>
        <p>{t('connectLedgerTips')}</p>
      </div>
    </div>
  )
}

export default ReConnectWallet
