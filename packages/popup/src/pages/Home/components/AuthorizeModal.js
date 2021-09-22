import PropTypes from 'prop-types'
import {useTranslation, Trans} from 'react-i18next'
import Modal from '@fluent-wallet/component-modal'
import Button from '@fluent-wallet/component-button'

function AuthorizeModal({open, onClose, onAuth, needAuthAccountName}) {
  const {t} = useTranslation()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('needAuthTitle')}
      contentClassName="tracking-tight"
      content={
        <Trans
          i18nKey="needAuthContent"
          values={{
            accountName: needAuthAccountName,
          }}
        />
      }
      actions={[
        <Button
          className="flex flex-1 mr-3"
          onClick={onClose}
          variant="outlined"
          key="no"
        >
          {t('no')}
        </Button>,
        <Button className="flex flex-1" onClick={onAuth} key="yes">
          {t('yes')}
        </Button>,
      ]}
    />
  )
}

AuthorizeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onAuth: PropTypes.func,
  needAuthAccountName: PropTypes.string,
}

export default AuthorizeModal
