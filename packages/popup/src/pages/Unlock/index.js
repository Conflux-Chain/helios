import {useState, useRef, useLayoutEffect} from 'react'
import {useHistory} from 'react-router-dom'
import Button from '@fluent-wallet/component-button'
import {HomeTitle, PasswordInput, LanguageNav} from '../../components'
import {useTranslation} from 'react-i18next'
import {RPC_METHODS, ROUTES} from '../../constants'
import {useSWRConfig} from 'swr'
import {request, validatePasswordReg, isKeyOf} from '../../utils'
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
  const inputRef = useRef(null)

  const validatePassword = value => {
    setErrorMessage(validatePasswordReg(value) ? '' : t('passwordRulesWarning'))
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
        .catch(e => {
          setLoading(false)
          setErrorMessage(
            e?.message?.indexOf?.('Invalid password') !== -1
              ? t('invalidPassword')
              : e?.message ?? t('invalidPasswordFromRpc'),
          )
        })
    }
  }

  const onKeyDown = e => {
    if (isKeyOf(e, 'enter')) {
      onUnlock()
    }
  }

  useLayoutEffect(() => {
    inputRef.current.focus()
  }, [])

  return (
    <div
      className="bg-secondary h-full w-full flex flex-col bg-welcome-background"
      id="unlockContainer"
    >
      <LanguageNav showLan={false} />
      <header className="flex flex-col items-center pb-7 mt-7">
        <img
          src="/images/logo-vertical.svg"
          alt="logo"
          className="mx-auto w-50 h-40"
        />
        <HomeTitle
          title={t('welcomeBack')}
          // subTitle={t('welcome')}
          containerStyle="text-center mt-[70px]"
        />
      </header>
      <main className="px-6 h-[154px] mb-15 absolute left-0 right-0 bottom-0">
        <div className="flex flex-col h-full justify-between">
          <section>
            <div className="text-sm text-gray-40 mb-2">{t('password')}</div>
            <PasswordInput
              validateInputValue={validatePassword}
              setInputValue={setPassword}
              errorMessage={errorMessage}
              value={password}
              id="unlockPassword"
              onKeyDown={onKeyDown}
              ref={inputRef}
            />
          </section>
          <section>
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
