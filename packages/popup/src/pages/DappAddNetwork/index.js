import PropTypes from 'prop-types'
import {DappFooter, TitleNav} from '../../components'
import {useTranslation} from 'react-i18next'
import {usePendingAuthReq} from '../../hooks'
function NetworkContentItem({labelText, contentText, containerClass = ''}) {
  return (
    <div className={containerClass}>
      <div className="text-xs text-gray-40">{labelText}</div>
      <div className="text-sm text-gray-80 font-medium mt-0.5 whitespace-nowrap overflow-hidden overflow-ellipsis">
        {contentText}
      </div>
    </div>
  )
}

NetworkContentItem.propTypes = {
  labelText: PropTypes.string.isRequired,
  contentText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  containerClass: PropTypes.string,
}

function DappAddNetwork() {
  const {t} = useTranslation()
  const {pendingAuthReq} = usePendingAuthReq()
  const [{req}] = pendingAuthReq?.length ? pendingAuthReq : [{}]

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
            <NetworkContentItem
              labelText={t('networkName')}
              contentText={req?.params?.[0]?.chainName || ''}
            />
            <NetworkContentItem
              labelText={t('networkUrl')}
              contentText={req?.params?.[0]?.rpcUrls?.[0] || ''}
              containerClass="mt-3"
            />
            <NetworkContentItem
              labelText={t('chainId')}
              contentText={req?.params?.[0]?.chainId || ''}
              containerClass="mt-3"
            />
            <NetworkContentItem
              labelText={`${t('currencySymbol')} (${t('optional')})`}
              contentText={req?.params?.[0]?.nativeCurrency?.symbol || ''}
              containerClass="mt-3"
            />
            <NetworkContentItem
              labelText={`${t('blockExplorerUrl')} (${t('optional')})`}
              contentText={req?.params?.[0]?.blockExplorerUrls?.[0] || ''}
              containerClass="mt-3"
            />
          </div>
        </main>
      </div>
      <DappFooter cancelText={t('cancel')} confirmText={t('addNetwork')} />
    </div>
  )
}

export default DappAddNetwork
