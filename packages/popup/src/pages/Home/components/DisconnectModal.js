import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Modal from '@fluent-wallet/component-modal'
import Button from '@fluent-wallet/component-button'

function DisconnectModal({open, onClose, onDisconnect}) {
  const {t} = useTranslation()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('disconnectTitle')}
      content={t('disconnectContent')}
      actions={[
        <Button
          className="flex flex-1 mr-3"
          onClick={onClose}
          variant="outlined"
          key="cancel"
        >
          {t('cancel')}
        </Button>,
        <Button
          className="flex flex-1"
          onClick={onDisconnect}
          key="disconnect"
          danger
        >
          {t('disconnect')}
        </Button>,
      ]}
    />
  )
}

DisconnectModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onDisconnect: PropTypes.func,
}

export default DisconnectModal
