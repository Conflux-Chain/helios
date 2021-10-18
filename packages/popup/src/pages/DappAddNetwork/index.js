import PropTypes from 'prop-types'
import {DappTransactionFooter, TitleNav} from '../../components'
import {useTranslation} from 'react-i18next'

function NetworkItem({labelText, contentText, containerClass = ''}) {
  return (
    <div className={containerClass}>
      <div className="text-xs text-gray-40">{labelText}</div>
      <div className="text-sm text-gray-80 font-medium mt-0.5 whitespace-nowrap overflow-hidden overflow-ellipsis">
        {contentText}
      </div>
    </div>
  )
}

NetworkItem.propTypes = {
  labelText: PropTypes.string.isRequired,
  contentText: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  containerClass: PropTypes.string,
}

function DappAddNetwork() {
  const {t} = useTranslation()

  return (
    <div
      id="dappAddNetworkContainer"
      className="flex flex-col h-full justify-between bg-blue-circles bg-no-repeat pb-4"
    >
      <div>
        <header>
          <TitleNav title={t('addNetwork')} hasGoBack={false} />
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
          <div className="bg-gray-4 mt-3 px-3 py-4">
            <NetworkItem labelText={t('networkName')} contentText="12313" />
            <NetworkItem
              labelText={t('networkUrl')}
              contentText="12313"
              containerClass="mt-3"
            />
            <NetworkItem
              labelText={t('chainId')}
              contentText="12313"
              containerClass="mt-3"
            />
            <NetworkItem
              labelText={`${t('currencySymbol')} (${t('optional')})`}
              contentText="12313"
              containerClass="mt-3"
            />
            <NetworkItem
              labelText={`${t('blockExplorerUrl')} (${t('optional')})`}
              contentText="12313123131231312313123131231312313123131231312313"
              containerClass="mt-3"
            />
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
