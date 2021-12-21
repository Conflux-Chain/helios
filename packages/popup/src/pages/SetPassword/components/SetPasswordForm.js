import {useState} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {PasswordInput} from '../../../components'
import useGlobalStore from '../../../stores'
import Button from '@fluent-wallet/component-button'
import {validatePasswordReg} from '../../../utils'
import {ROUTES} from '../../../constants'

const {SELECT_CREATE_TYPE} = ROUTES
function SetPasswordForm() {
  const history = useHistory()
  const {t} = useTranslation()
  const setCreatedPassword = useGlobalStore(state => state.setCreatedPassword)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmErrorMessage, setConfirmErrorMessage] = useState('')

  // TODO: Replace err msg
  const validatePassword = value => {
    if (validatePasswordReg(value)) {
      setConfirmErrorMessage(
        value !== confirmPassword ? '输入的密码不一致' : '',
      )
      return setErrorMessage('')
    }
    setErrorMessage('something wrong')
  }
  // TODO: Replace err msg
  const validateConfirmPassword = value => {
    if (validatePasswordReg(password)) {
      if (password === value) {
        return setConfirmErrorMessage('')
      }
      setConfirmErrorMessage('输入的密码不一致')
    }
  }

  const onCreate = () => {
    validatePassword(password)
    validatePassword(confirmPassword)
    if (password && confirmPassword) {
      setCreatedPassword(confirmPassword)
      history.push(SELECT_CREATE_TYPE)
    }
  }

  return (
    <div
      id="setPasswordFormContainer"
      className="bg-white rounded px-4 pt-8  h-full box-border mb-4 flex flex-col justify-between"
    >
      <section>
        <legend className="text-gray-40 text-sm mb-3">{t('setPWD')}</legend>
        <PasswordInput
          validateInputValue={validatePassword}
          setInputValue={setPassword}
          errorMessage={errorMessage}
          value={password}
          id="password"
        />
        {errorMessage ? null : <div className="m-0 h-6" />}
        <PasswordInput
          validateInputValue={validateConfirmPassword}
          setInputValue={setConfirmPassword}
          errorMessage={confirmErrorMessage}
          value={confirmPassword}
          id="confirmPassword"
        />
      </section>

      <section className="mb-15">
        <em className="text-xs not-italic text-center text-gray-40">
          {t('rememberPWD')}
        </em>
        <Button
          id="setPasswordFormBtn"
          className="w-70 mt-4 mx-auto"
          disabled={!!errorMessage || !!confirmErrorMessage}
          onClick={onCreate}
        >
          {t('create')}
        </Button>
      </section>
    </div>
  )
}

export default SetPasswordForm
