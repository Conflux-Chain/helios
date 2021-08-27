import {useState} from 'react'
import Button from '@cfxjs/component-button'
import {LanguageNav, HomeTitle, PasswordInput} from '../../components'
import {useTranslation} from 'react-i18next'
import {useRPC} from '@cfxjs/use-rpc'
import {passwordRegExp} from '../../constants'

const validate = value => {
  return passwordRegExp.test(value)
}
const UnlockPage = () => {
  const {t} = useTranslation()
  const [loginMethod, setLoginMethod] = useState(null)
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = event => {
    event.preventDefault()
    setInputErrorMessage(password)
  }
  const setInputErrorMessage = value => {
    // TODO: Replace err msg
    setErrorMessage(validate(value) ? '' : 'something wrong')
  }
  const login = () => {
    if (password) {
      setLoginMethod('wallet_unlock')
    }
  }

  const loginResult = useRPC(loginMethod, {password})
  console.log('loginResult', loginResult)

  return (
    <>
      <LanguageNav />
      <header>
        <img src="assets/images/logo.png" alt="logo" />
        <HomeTitle title={t('welcomeBack')} subTitle={t('welcome')} />
      </header>
      <main>
        <form action="" onSubmit={handleSubmit}>
          <div>{t('password')}</div>
          <PasswordInput
            setInputErrorMessage={setInputErrorMessage}
            setInputValue={setPassword}
            errorMessage={errorMessage}
          />
          <Button fullWidth disabled={!!errorMessage} onClick={login}>
            {t('unlock')}
          </Button>
        </form>
      </main>
    </>
  )
}

export default UnlockPage
