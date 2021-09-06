import {useState} from 'react'
import {useHistory} from 'react-router-dom'
import Button from '@cfxjs/component-button'
import {LanguageNav, HomeTitle, PasswordInput} from '../../components'
import {useTranslation} from 'react-i18next'
import {PASSWORD_REG_EXP, GET_WALLET_STATUS} from '../../constants'
import {useSWRConfig} from 'swr'
import {request} from '../../utils/'

const validate = value => {
  return PASSWORD_REG_EXP.test(value)
}
const UnlockPage = () => {
  const history = useHistory()
  const {t} = useTranslation()
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const {mutate} = useSWRConfig()

  const handleSubmit = event => {
    event.preventDefault()
    setInputErrorMessage(password)
  }
  const setInputErrorMessage = value => {
    // TODO: Replace err msg
    setErrorMessage(validate(value) ? '' : 'something wrong')
  }
  const login = async () => {
    if (password) {
      try {
        const res = await request('wallet_unlock', {password})
        if (res?.error) {
          throw res.error
        }
        if (res.result) {
          mutate([...GET_WALLET_STATUS])
          history.push('/')
        }
      } catch (err) {
        // TODO: Replace err msg
        err.message && setErrorMessage(err.message.split('\n')[0])
      }
    }
  }

  return (
    <div className="bg-secondary h-full flex flex-col">
      <LanguageNav />
      <header className="flex flex-col items-center pb-7">
        <img
          src="assets/images/logo.png"
          alt="logo"
          className="mx-auto w-25 h-25 mt-2"
        />
        <HomeTitle
          title={t('welcomeBack')}
          subTitle={t('welcome')}
          containerStyle="text-center"
        />
      </header>
      <main className="px-6  flex-1">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full justify-between"
        >
          <section>
            <div className="text-sm text-gray-40 mb-2">{t('password')}</div>
            <PasswordInput
              setInputErrorMessage={setInputErrorMessage}
              setInputValue={setPassword}
              errorMessage={errorMessage}
            />
          </section>
          <section className="h-58">
            <Button fullWidth disabled={!!errorMessage} onClick={login}>
              {t('unlock')}
            </Button>
          </section>
        </form>
      </main>
    </div>
  )
}

export default UnlockPage
