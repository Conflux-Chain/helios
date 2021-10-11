import {DappTransactionFooter} from '../../components'
import {useTranslation} from 'react-i18next'

function DappAddNetwork() {
  const {t} = useTranslation()

  return (
    <div className="flex flex-col h-full justify-between bg-blue-circles bg-no-repeat">
      <div>
        <header>
          <div className="text-sm text-gray-100 h-13 flex items-center justify-center">
            {t('addNetwork')}
          </div>
        </header>
        <main className="mt-3 px-3">
          <div className="ml-1">
            <div>
              <div className="text-sm text-gray-80 font-medium">
                {t('allowAddNetwork')}
              </div>
              <div className="text-xs mt-1 text-gray-40">
                {t('warningAddNetwork')}
              </div>
            </div>
            <p
              className="cursor-pointer text-xs text-primary mt-1"
              aria-hidden="true"
              onClick={() => window && window.open('')}
            >
              {t('learnMore')}
            </p>
          </div>
          <div className="bg-primary-4 mt-3 px-3 py-4 break-words">
            <div>
              <div className="text-xs text-gray-40">{t('networkName')}</div>
              <div className="text-sm text-gray-80 font-medium mt-0.5">
                21312
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-40">{t('NetworkUrl')}</div>
              <div className="text-sm text-gray-80 font-medium mt-0.5">
                21312
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-40">{t('chainId')}</div>
              <div className="text-sm text-gray-80 font-medium mt-0.5">
                21312
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-40">
                {t('currencySymbol')} ({t('optional')})
              </div>
              <div className="text-sm text-gray-80 font-medium mt-0.5">
                21312213122131221312213122131221312213122131221312
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-40">
                {t('blockExplorerUrl')} ({t('optional')})
              </div>
              <div className="text-sm text-gray-80 font-medium mt-0.5">
                21312
              </div>
            </div>
          </div>
        </main>
      </div>
      <DappTransactionFooter
        cancelText={t('cancel')}
        confirmText={t('addToken')}
      />
    </div>
  )
}

export default DappAddNetwork
