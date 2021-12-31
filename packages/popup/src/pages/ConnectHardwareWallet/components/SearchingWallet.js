import {useTranslation} from 'react-i18next'

function SearchingWallet() {
  const {t} = useTranslation()

  return (
    <div className="flex flex-col items-center">
      <img src="/images/searching-hm-wallet.gif" alt="searching" />
      <div className="w-110 text-center">
        <p className="text-gray-80 text-lg font-medium mb-2">
          {t('searchHwWallet')}
        </p>
        <p className="text-gray-60 text-sm">{t('connectLedgerTips')}</p>
      </div>
    </div>
  )
}

export default SearchingWallet
