import {useState} from 'react'
import {useHistory} from 'react-router-dom'
import Button from '@fluent-wallet/component-button'
import {LanguageNav, HomeTitle, PasswordInput} from '../../components'
import {useTranslation} from 'react-i18next'
import {GET_WALLET_LOCKED_STATUS, UNLOCK} from '../../constants'
import {useSWRConfig} from 'swr'
import {request, validatePasswordReg} from '../../utils'

const UnlockPage = () => {
  const history = useHistory()
  const {t} = useTranslation()
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const {mutate} = useSWRConfig()

  const validatePassword = value => {
    // TODO: Replace err msg
    setErrorMessage(validatePasswordReg(value) ? '' : 'something wrong')
  }
  const onUnlock = () => {
    if (password) {
      request(UNLOCK, {password}).then(({error, result}) => {
        if (error) setErrorMessage(error.message.split('\n')[0])
        if (result) {
          mutate([GET_WALLET_LOCKED_STATUS])
          history.push('/')
        }
      })
    }
  }
  const onSubmit = event => {
    event.preventDefault()
    validatePassword(password)
  }

  return (
    <div className="bg-secondary h-full flex flex-col">
      <LanguageNav />
      <header className="flex flex-col items-center pb-7">
        <img
          src="images/logo.svg"
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
          onSubmit={onSubmit}
          className="flex flex-col h-full justify-between"
        >
          <section>
            <div className="text-sm text-gray-40 mb-2">{t('password')}</div>
            <PasswordInput
              validateInputValue={validatePassword}
              setInputValue={setPassword}
              errorMessage={errorMessage}
              value={password}
            />
          </section>
          <section className="mb-48">
            <Button fullWidth disabled={!!errorMessage} onClick={onUnlock}>
              {t('unlock')}
            </Button>
          </section>
        </form>
      </main>
    </div>
  )
}

export default UnlockPage
