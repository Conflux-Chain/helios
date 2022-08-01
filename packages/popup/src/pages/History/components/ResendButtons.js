import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Button from '@fluent-wallet/component-button'
import {
  RocketOutlined,
  CloseCircleOutlined,
} from '@fluent-wallet/component-icons'

import {ROUTES} from '../../../constants'

const {RESEND_TRANSACTION} = ROUTES

function ResendButtons({
  className = '',
  buttonClassName = '',
  buttonTextClassName = '',
  blank = '',
  // cancel: transaction has already been cancelled
  sendAction = '',
  hash,
}) {
  const {t} = useTranslation()
  const history = useHistory()

  if (sendAction === 'cancel') {
    return (
      <div className={`flex ${className}`}>
        <Button
          id="cancel-canceled-tx"
          variant="outlined"
          key="cancel"
          className={`flex-1 !border-transparent ${buttonClassName}`}
          onClick={() => {
            history.push({
              pathname: RESEND_TRANSACTION,
              search: `type=expeditedCancellation&hash=${hash}`,
            })
          }}
        >
          <RocketOutlined className="w-3 h-3" />
          <span className={buttonTextClassName}>
            {t('expeditedCancellation')}
          </span>
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex ${className}`}>
      <Button
        id="cancel-tx"
        variant="outlined"
        key="cancel"
        className={`flex-1 !border-transparent ${buttonClassName}`}
        onClick={() => {
          history.push({
            pathname: RESEND_TRANSACTION,
            search: `type=cancel&hash=${hash}`,
          })
        }}
      >
        <CloseCircleOutlined className="w-3 h-3" />
        <span className={buttonTextClassName}>{t('cancel')}</span>
      </Button>

      <Button
        id="speedup-tx"
        className={`flex-1 !border-transparent ${buttonClassName} ${blank}`}
        variant="outlined"
        key="confirm"
        onClick={() => {
          history.push({
            pathname: RESEND_TRANSACTION,
            search: `type=speedup&hash=${hash}`,
          })
        }}
      >
        <RocketOutlined className="w-3 h-3" />
        <span className={buttonTextClassName}>{t('speedUp')}</span>
      </Button>
    </div>
  )
}

ResendButtons.propTypes = {
  className: PropTypes.string,
  buttonClassName: PropTypes.string,
  buttonTextClassName: PropTypes.string,
  blank: PropTypes.string,
  hash: PropTypes.string,
  sendAction: PropTypes.string,
}

export default ResendButtons
