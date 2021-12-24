import {useState} from 'react'
import {useHistory} from 'react-router-dom'
import Button from '@fluent-wallet/component-button'
import {HomeTitle, PasswordInput, LanguageNav} from '../../components'
import {useTranslation} from 'react-i18next'
import {RPC_METHODS, ROUTES} from '../../constants'
import {useSWRConfig} from 'swr'
import {request, validatePasswordReg} from '../../utils'
import useLoading from '../../hooks/useLoading'

const {WALLET_IS_LOCKED, WALLET_UNLOCK} = RPC_METHODS

const {HOME} = ROUTES
const UnlockPage = () => {
  const history = useHistory()
  const {t} = useTranslation()
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const {mutate} = useSWRConfig()
  const {setLoading} = useLoading()

  const validatePassword = value => {
    // TODO: Replace err msg
    setErrorMessage(validatePasswordReg(value) ? '' : 'something wrong')
  }
  const onUnlock = () => {
    validatePassword(password)
    if (password) {
      setLoading(true)
      request(WALLET_UNLOCK, {password})
        .then(() => {
          mutate([WALLET_IS_LOCKED], false)
          setLoading(false)
          history.push(HOME)
        })
        .catch(error => {
          setLoading(false)
          setErrorMessage(error?.message?.split('\n')[0]) ?? error
        })
    }
  }

  return (
    <div
      className="bg-secondary h-full w-full flex flex-col"
      id="unlockContainer"
    >
      <LanguageNav />
      <header className="flex flex-col items-center pb-7">
        <img
          src="/images/logo.svg"
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
        <div className="flex flex-col h-full justify-between">
          <section>
            <div className="text-sm text-gray-40 mb-2">{t('password')}</div>
            <PasswordInput
              validateInputValue={validatePassword}
              setInputValue={setPassword}
              errorMessage={errorMessage}
              value={password}
              id="unlockPassword"
            />
          </section>
          <section className="mb-48">
            <Button
              fullWidth
              disabled={!!errorMessage}
              onClick={onUnlock}
              id="unlockBtn"
            >
              {t('unlock')}
            </Button>
          </section>
        </div>
      </main>
    </div>
  )
}

export default UnlockPage
