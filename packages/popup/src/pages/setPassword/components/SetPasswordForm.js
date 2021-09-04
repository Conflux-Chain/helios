import PropTypes from 'prop-types'
import {useState} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {PASSWORD_REG_EXP} from '../../../constants'
import {PasswordInput} from '../../../components'
import useGlobalStore from '../../../stores'
import Button from '@cfxjs/component-button'

const validate = value => {
  return PASSWORD_REG_EXP.test(value)
}

const SetPasswordForm = ({formStyle, legendStyle, desStyle, buttonStyle}) => {
  const history = useHistory()
  const {t} = useTranslation()
  const setCreatedPassword = useGlobalStore(state => state.setCreatedPassword)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmErrorMessage, setConfirmErrorMessage] = useState('')

  // TODO: Replace err msg
  const setInputErrorMessage = value => {
    if (validate(value)) {
      setConfirmErrorMessage(
        value !== confirmPassword ? '输入的密码不一致' : '',
      )
      return setErrorMessage('')
    }
    setErrorMessage('something wrong')
  }
  // TODO: Replace err msg
  const setConfirmInputErrorMessage = value => {
    if (password === value) {
      return setConfirmErrorMessage('')
    }
    setConfirmErrorMessage('输入的密码不一致')
  }

  const handleSubmit = event => {
    event.preventDefault()
    setInputErrorMessage(password)
    setConfirmInputErrorMessage(confirmPassword)
  }

  const create = () => {
    if (!errorMessage && !confirmErrorMessage && password && confirmPassword) {
      setCreatedPassword(confirmPassword)
      history.push('/select-create-type')
    }
  }
  return (
    <form onSubmit={handleSubmit} className={formStyle || ''}>
      <legend className={legendStyle || ''}>{t('setPWD')}</legend>
      <PasswordInput
        setInputErrorMessage={setInputErrorMessage}
        setInputValue={setPassword}
        errorMessage={errorMessage}
      />
      {errorMessage ? null : <em className="m-0 h-6 block" />}

      <PasswordInput
        setInputErrorMessage={setConfirmInputErrorMessage}
        setInputValue={setConfirmPassword}
        errorMessage={confirmErrorMessage}
      />
      <em className={desStyle || ''}>{t('rememberPWD')}</em>
      <Button
        className={buttonStyle}
        disabled={!!errorMessage || !!confirmErrorMessage}
        onClick={create}
      >
        {t('create')}
      </Button>
    </form>
  )
}
SetPasswordForm.propTypes = {
  formStyle: PropTypes.string,
  legendStyle: PropTypes.string,
  desStyle: PropTypes.string,
  buttonStyle: PropTypes.string,
}

export default SetPasswordForm
