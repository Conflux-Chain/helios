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

const SetPasswordForm = () => {
  const history = useHistory()
  const {t} = useTranslation()
  const setCreatedPassword = useGlobalStore(state => state.setCreatedPassword)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmErrorMessage, setConfirmErrorMessage] = useState('')

  // TODO: Replace err msg
  const validateWhenInputPassword = value => {
    if (validate(value)) {
      setConfirmErrorMessage(
        value !== confirmPassword ? '输入的密码不一致' : '',
      )
      return setErrorMessage('')
    }
    setErrorMessage('something wrong')
  }
  // TODO: Replace err msg
  const validateWhenInputConfirmPassword = value => {
    if (password === value) {
      return setConfirmErrorMessage('')
    }
    setConfirmErrorMessage('输入的密码不一致')
  }

  const handleSubmit = event => {
    event.preventDefault()
    validateWhenInputPassword(password)
    validateWhenInputConfirmPassword(confirmPassword)
  }

  const create = () => {
    if (!errorMessage && !confirmErrorMessage && password && confirmPassword) {
      setCreatedPassword(confirmPassword)
      history.push('/select-create-type')
    }
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded px-4 pt-8  h-full box-border mb-4 flex flex-col justify-between"
    >
      <section>
        <legend className="text-gray-40 text-sm mb-3">{t('setPWD')}</legend>
        <PasswordInput
          setInputErrorMessage={validateWhenInputPassword}
          setInputValue={setPassword}
          errorMessage={errorMessage}
        />
        {errorMessage ? null : <em className="m-0 h-6 block" />}

        <PasswordInput
          setInputErrorMessage={validateWhenInputConfirmPassword}
          setInputValue={setConfirmPassword}
          errorMessage={confirmErrorMessage}
        />
      </section>

      <section className="mb-15">
        <em className="text-xs not-italic text-center text-gray-40">
          {t('rememberPWD')}
        </em>
        <Button
          className="w-70 mt-4 mx-auto"
          disabled={!!errorMessage || !!confirmErrorMessage}
          onClick={create}
        >
          {t('create')}
        </Button>
      </section>
    </form>
  )
}

export default SetPasswordForm
