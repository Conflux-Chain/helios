import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import Modal from '@fluent-wallet/component-modal'
import Button from '@fluent-wallet/component-button'
import {PasswordInput} from '.'
import {request, validatePasswordReg} from '../utils'

function ConfirmPassword({
  open,
  onCancel,
  onConfirmCallback,
  setPassword,
  password,
  rpcMethod = '',
  confirmParams = {},
}) {
  const {t} = useTranslation()
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('')
  const [sendingRequestStatus, setSendingRequestStatus] = useState(false)

  const validatePassword = value => {
    const isValid = validatePasswordReg(value)
    setPasswordErrorMessage(isValid ? '' : t('passwordRulesWarning'))
    return isValid
  }
  useEffect(() => {
    setPasswordErrorMessage('')
  }, [open])

  const onClick = () => {
    if (
      !validatePassword(password) ||
      !rpcMethod ||
      !Object.keys(confirmParams).length ||
      sendingRequestStatus
    ) {
      return
    }
    setSendingRequestStatus(true)
    request(rpcMethod, {...confirmParams, password})
      .then(res => {
        onConfirmCallback(res).then(() => {
          setSendingRequestStatus(false)
        })
      })
      .catch(e => {
        setSendingRequestStatus(false)
        setPasswordErrorMessage(
          e?.message?.indexOf?.('Invalid password') !== -1
            ? t('invalidPassword')
            : e?.message ?? t('invalidPasswordFromRpc'),
        )
      })
  }

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
          containerClassName="mt-1"
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
          onClick={onClick}
          disabled={!!passwordErrorMessage}
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
  setPassword: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  rpcMethod: PropTypes.string.isRequired,
  confirmParams: PropTypes.object.isRequired,
  onConfirmCallback: PropTypes.func.isRequired,
}

export default ConfirmPassword
