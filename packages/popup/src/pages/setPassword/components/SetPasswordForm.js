import {useState} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Button from '@cfxjs/component-button'
import {passwordRegExp} from '../../../constants'
import {PasswordInput} from '../../../components'
import {useStore} from '../../../store'

const validate = value => {
  return passwordRegExp.test(value)
}
const SetPasswordForm = () => {
  const history = useHistory()
  const {t} = useTranslation()
  const {createNewPassword, newPassword} = useStore()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmErrorMessage, setConfirmErrorMessage] = useState('')

  // TODO: Replace err msg
  const setInputErrorMessage = value => {
    if (validate(value)) {
      if (value !== confirmPassword) {
        setConfirmErrorMessage('输入的密码不一致')
      }
      return setErrorMessage('')
    }
    setErrorMessage('something wrong')
  }
  // TODO: Replace err msg
  const setConfirmInputErrorMessage = value => {
    setConfirmErrorMessage(password === value ? '' : '输入的密码不一致')
  }

  const handleSubmit = event => {
    event.preventDefault()
    setInputErrorMessage(password)
    setConfirmInputErrorMessage(confirmPassword)
  }

  const create = () => {
    if (!errorMessage && !confirmErrorMessage && password && confirmPassword) {
      createNewPassword(confirmPassword)
      history.push('/select-create-type')
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <h3>{t('setPWD')}</h3>
      <div>{newPassword}</div>
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
      <h3 className="text-center">{t('rememberPWD')}</h3>
      <Button
        fullWidth
        disabled={!!errorMessage || !!confirmErrorMessage}
        onClick={create}
      >
        {t('create')}
      </Button>
    </form>
  )
}

export default SetPasswordForm
