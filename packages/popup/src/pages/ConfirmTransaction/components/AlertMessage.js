import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Link from '@fluent-wallet/component-link'
import {
  ExclamationCircleFilled,
  CloseCircleFilled,
} from '@fluent-wallet/component-icons'
import {useLedgerAppName} from '../../../hooks'
import {ROUTES} from '../../../constants'

const {CONNECT_HARDWARE_WALLET} = ROUTES

function AlertMessage({
  isHwUnAuth,
  isHwOpenAlert,
  estimateError,
  isContractError,
  isDapp,
}) {
  const {t} = useTranslation()
  const LedgerAppName = useLedgerAppName()

  if (!isHwUnAuth && !isHwOpenAlert && !estimateError) return null
  return (
    <div className="bg-bg bg-gray-circles bg-no-repeat bg-contain w-full flex flex-col absolute bottom-0 pt-6 pb-[88px] px-3 rounded-t-xl">
      <div className="flex items-start">
        <span className="shrink-0">
          {(isHwUnAuth || isHwOpenAlert || isContractError) && (
            <ExclamationCircleFilled className="w-[18px] h-[18px] mr-1 text-warning" />
          )}
          {!isContractError && !!estimateError && (
            <CloseCircleFilled className="w-[18px] h-[18px] mr-1 text-error" />
          )}
        </span>
        <span className="font-medium text-warning">
          {isHwUnAuth && t('ledgerIsNotConnected')}
          {(isHwOpenAlert || isContractError) && t('warning')}
          <span className="text-error">
            {!isContractError && !!estimateError && t('error')}
          </span>
        </span>
      </div>
      {isHwUnAuth && (
        <div className="text-xs text-warning mt-3 w-fit">
          <Link
            onClick={() =>
              window.open(
                `${location.origin}${location.pathname.replace(
                  isDapp ? 'notification.html' : 'popup.html',
                  'page.html',
                )}#${CONNECT_HARDWARE_WALLET}?action=close`,
              )
            }
            className="underline mt-1"
          >
            {t('openExpandView')}
          </Link>
        </div>
      )}
      {(isHwOpenAlert || isContractError) && (
        <div className="text-xs text-warning mt-3">
          {isHwOpenAlert &&
            t('hwOpenApp', {
              appName: LedgerAppName,
            })}
        </div>
      )}
      {!isContractError && !!estimateError && (
        <div className="text-xs text-error mt-3">{estimateError}</div>
      )}
    </div>
  )
}

AlertMessage.propTypes = {
  isHwUnAuth: PropTypes.bool,
  isHwOpenAlert: PropTypes.bool,
  estimateError: PropTypes.string,
  isContractError: PropTypes.bool,
  isDapp: PropTypes.bool,
}

export default AlertMessage
