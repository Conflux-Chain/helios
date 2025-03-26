import PropTypes from 'prop-types'
import {WarningBGFilled} from '@fluent-wallet/component-icons'
import Modal from '@fluent-wallet/component-modal'
import Checkbox from '@fluent-wallet/component-checkbox'
import Button from '@fluent-wallet/component-button'
import {useTranslation} from 'react-i18next'

export const SIWERiskModal = ({
  open,
  onClose,
  title,
  content,
  knownRisk,
  onConfirmationToggle,
  isUserConfirmed,
}) => {
  const {t} = useTranslation()
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      content={
        <div>
          <div className="flex justify-center">
            <WarningBGFilled width={200} height={100} />
          </div>
          <div className="text-gray-60 text-base text-center">{content}</div>
          {knownRisk && (
            <div className="flex mt-2 bg-warning-10 p-2 rounded">
              <button
                type="button"
                onClick={onConfirmationToggle}
                id="siweRiskModalCheckbox"
              >
                <Checkbox checked={isUserConfirmed} />
              </button>
              <span className="ml-1 text-warning text-sm">{knownRisk}</span>
            </div>
          )}
        </div>
      }
      actions={[
        <Button key="confirm" className="flex-1" onClick={onClose}>
          {t('siweModalConfirmBtn')}
        </Button>,
      ]}
    />
  )
}

export default SIWERiskModal

SIWERiskModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  content: PropTypes.string,
  knownRisk: PropTypes.string,
  onConfirmationToggle: PropTypes.func,
  isUserConfirmed: PropTypes.bool,
}
