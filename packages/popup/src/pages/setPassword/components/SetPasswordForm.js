import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import Button from '@cfxjs/component-button'
import {passwordRegExp} from '../../../constants'
import {PasswordInput} from '../../../components'

const validate = value => {
  return passwordRegExp.test(value)
}
const SetPasswordForm = () => {
  const {t} = useTranslation()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [confirmErrorMessage, setConfirmErrorMessage] = useState('')

  const setInputErrorMessage = value => {
    // TODO: Replace err msg
    setErrorMessage(
      validate(value) && confirmPassword === value ? '' : 'something wrong',
    )
  }

  const setConfirmInputErrorMessage = value => {
    setConfirmErrorMessage(
      validate(value) && password === value ? '' : 'something wrong',
    )
  }
  const handleSubmit = event => {
    event.preventDefault()
    setInputErrorMessage(password)
    setConfirmInputErrorMessage(confirmPassword)
  }

  const create = () => {
    // TODO: Wait for PD
    console.log('password', password, confirmPassword)
  }
  return (
    <form onSubmit={handleSubmit}>
      <div>{t('setPWD')}</div>
      <PasswordInput
        setInputErrorMessage={setInputErrorMessage}
        setInputValue={setPassword}
        errorMessage={errorMessage}
      />
      <PasswordInput
        setInputErrorMessage={setConfirmInputErrorMessage}
        setInputValue={setConfirmPassword}
        errorMessage={confirmErrorMessage}
      />
      <div className="text-center">{t('rememberPWD')}</div>
      <Button fullWidth disabled={!!errorMessage} onClick={create}>
        {t('create')}
      </Button>
    </form>
  )
}

export default SetPasswordForm
