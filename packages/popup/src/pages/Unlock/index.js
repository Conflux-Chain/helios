import {useState} from 'react'
import Button from '@cfxjs/component-button'
import {LanguageNav, HomeTitle, PasswordInput} from '../../components'
import {useTranslation} from 'react-i18next'
import {passwordRegExp} from '../../constants'
import {useStore} from '../../store'

const validate = value => {
  return passwordRegExp.test(value)
}
const UnlockPage = () => {
  console.log('rendering...')
  const {t} = useTranslation()
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const {unlockWallet} = useStore()
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
      unlockWallet(password)
        .then(res => {
          console.log('res', res)
        })
        .catch(err => {
          console.log('err', err)
        })
    }
  }

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
