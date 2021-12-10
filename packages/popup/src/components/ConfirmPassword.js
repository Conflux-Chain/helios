import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Modal from '@fluent-wallet/component-modal'
import Button from '@fluent-wallet/component-button'
import {PasswordInput} from '.'

function ConfirmPassword({
  open,
  onCancel,
  onConfirm,
  validatePassword,
  setPassword,
  passwordErrorMessage,
  password,
}) {
  const {t} = useTranslation()

  return (
    <Modal
      open={open}
      onClose={onCancel}
      onCancel={onCancel}
      title={t('enterPassword')}
      content={
        <PasswordInput
          validateInputValue={validatePassword}
          setInputValue={setPassword}
          errorMessage={passwordErrorMessage}
          value={password}
          id="confirmPassword"
        />
      }
      actions={[
        <Button
          className="flex flex-1 mr-3"
          onClick={onCancel}
          variant="outlined"
          key="cancel"
          id="cancel-btn"
        >
          {t('cancel')}
        </Button>,
        <Button
          className="flex flex-1"
          onClick={onConfirm}
          key="confirm"
          id="confirm-btn"
        >
          {t('confirm')}
        </Button>,
      ]}
    />
  )
}
ConfirmPassword.propTypes = {
  open: PropTypes.bool.isRequired,
  password: PropTypes.string.isRequired,
  passwordErrorMessage: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  validatePassword: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}

export default ConfirmPassword
