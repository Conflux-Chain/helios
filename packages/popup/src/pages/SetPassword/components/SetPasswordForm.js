import {useState, useRef, useLayoutEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {PasswordInput} from '../../../components'
import useGlobalStore from '../../../stores'
import Button from '@fluent-wallet/component-button'
import {validatePasswordReg, isKeyOf} from '../../../utils'
import {ROUTES} from '../../../constants'
import {useDisplayErrorMessage} from '../../../hooks'

const {SELECT_CREATE_TYPE} = ROUTES
function SetPasswordForm() {
  const history = useHistory()
  const {t} = useTranslation()
  const setCreatedPassword = useGlobalStore(state => state.setCreatedPassword)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmErrorMessage, setConfirmErrorMessage] = useState('')
  const displayErrorMessage = useDisplayErrorMessage(errorMessage)
  const displayConfirmErrorMessage = useDisplayErrorMessage(confirmErrorMessage)

  const inputRef = useRef(null)
  const confirmInputRef = useRef(null)

  useLayoutEffect(() => {
    inputRef.current.focus()
  }, [])

  const validatePassword = value => {
    if (validatePasswordReg(value)) {
      setConfirmErrorMessage(
        value !== confirmPassword ? 'invalidConfirmPassword' : '',
      )
      return setErrorMessage('')
    } else {
      setConfirmErrorMessage('')
      setErrorMessage('passwordRulesWarning')
    }
  }
  const validateConfirmPassword = value => {
    if (validatePasswordReg(password)) {
      if (password === value) {
        return setConfirmErrorMessage('')
      }
      setConfirmErrorMessage('invalidConfirmPassword')
    }
  }

  const onCreate = () => {
    validatePassword(password)
    validateConfirmPassword(confirmPassword)
    if (password && confirmPassword) {
      setCreatedPassword(confirmPassword)
      history.push(SELECT_CREATE_TYPE)
    }
  }

  const onKeyDown = e => {
    if (isKeyOf(e, 'enter') && !errorMessage) {
      confirmInputRef.current.focus()
    }
  }

  const onConfirmInputKeyDown = e => {
    if (isKeyOf(e, 'enter')) {
      onCreate()
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
          errorMessage={displayErrorMessage}
          value={password}
          id="password"
          onKeyDown={onKeyDown}
          errorClassName={displayErrorMessage ? '' : 'h-6'}
          ref={inputRef}
        />
        <PasswordInput
          validateInputValue={validateConfirmPassword}
          setInputValue={setConfirmPassword}
          errorMessage={
            displayConfirmErrorMessage && confirmPassword
              ? displayConfirmErrorMessage
              : ''
          }
          value={confirmPassword}
          id="confirmPassword"
          onKeyDown={onConfirmInputKeyDown}
          ref={confirmInputRef}
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
