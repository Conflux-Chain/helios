import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Alert from '@fluent-wallet/component-alert'
import Link from '@fluent-wallet/component-link'
import {ROUTES} from '../constants'
const {CONNECT_HARDWARE_WALLET} = ROUTES

function HwAlert({open, ...props}) {
  const {t} = useTranslation()

  return (
    <Alert
      open={open}
      type="error"
      closable={false}
      width="w-full"
      content={
        <div className="flex flex-col">
          {t('ledgerIsNotConnected')}
          <Link
            onClick={() =>
              window.open(
                `${
                  location.href.split('#')[0]
                }#${CONNECT_HARDWARE_WALLET}?action=close`,
              )
            }
            className="underline mt-1"
          >
            {t('openExpandView')}
          </Link>
        </div>
      }
      {...props}
    />
  )
}

HwAlert.propTypes = {
  open: PropTypes.bool.isRequired,
  className: PropTypes.string,
}

export default HwAlert
