import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {
  RocketOutlined,
  CloseCircleOutlined,
} from '@fluent-wallet/component-icons'

function ResendButtons({
  onCancelPendingTx,
  onSpeedupPendingTx,
  className = '',
  buttonClassName = '',
  buttonTextClassName = '',
  blank = '',
}) {
  const {t} = useTranslation()

  return (
    <div className={`flex ${className}`}>
      <Button
        id="cancel-tx"
        variant="outlined"
        key="cancel"
        className={`flex-1 !border-transparent ${buttonClassName} ${blank}`}
        onClick={() => onCancelPendingTx?.()}
      >
        <CloseCircleOutlined className="w-3 h-3" />
        <span className={buttonTextClassName}>{t('cancel')}</span>
      </Button>

      <Button
        id="speedup-tx"
        className={`flex-1 !border-transparent ${buttonClassName}`}
        variant="outlined"
        key="confirm"
        onClick={() => onSpeedupPendingTx?.()}
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
  onCancelPendingTx: PropTypes.func,
  onSpeedupPendingTx: PropTypes.func,
}

export default ResendButtons
