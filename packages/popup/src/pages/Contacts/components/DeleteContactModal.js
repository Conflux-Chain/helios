import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Modal from '@fluent-wallet/component-modal'
import Button from '@fluent-wallet/component-button'

function DeleteContactModal({open, onClose, onDelete}) {
  const {t} = useTranslation()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('deleteContactTitle')}
      content={t('deleteContactContent')}
      actions={[
        <Button
          className="flex flex-1 mr-3"
          onClick={onClose}
          variant="outlined"
          key="cancel"
          id="cancel"
        >
          {t('cancel')}
        </Button>,
        <Button
          className="flex flex-1"
          onClick={onDelete}
          key="confirm"
          danger
          id="confirm"
        >
          {t('confirm')}
        </Button>,
      ]}
    />
  )
}

DeleteContactModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
}

export default DeleteContactModal
