import {useTranslation} from 'react-i18next'

function SearchingWallet() {
  const {t} = useTranslation()

  return (
    <div>
      <img src="/images/searching-hm-wallet.gif" alt="searching" />
      <div>
        <p>{t('searchHmWallet')}</p>
        <p>{t('connectLedgerTips')}</p>
      </div>
    </div>
  )
}

export default SearchingWallet
