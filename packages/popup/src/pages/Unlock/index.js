import {useState} from 'react'
import Button from '@cfxjs/component-button'
import Input from '@cfxjs/component-input'
import {LanguageNav, HomeTitle} from '../../components'
import {useTranslation} from 'react-i18next'
import {passwordRegExp} from '../../constants'
import {useRPC} from '@cfxjs/use-rpc'
import {EyeClose, EyeOpen} from '@cfxjs/component-icons'

const UnlockPage = () => {
  const {t} = useTranslation()
  const [errorMessage, setErrorMessage] = useState('')
  const [loginMethod, setLoginMethod] = useState(null)
  const [password, setPassword] = useState('')
  const [eyeStatus, setEyeStatus] = useState('close')
  const onSuffixClick = () => {
    setEyeStatus(eyeStatus === 'close' ? 'open' : 'close')
  }

  const onInputChange = e => {
    // TODO: Replace err msg
    setErrorMessage(
      passwordRegExp.test(e.target.value) ? '' : 'something wrong',
    )
    setPassword(e.target.value)
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
      <img src="assets/images/logo.png" alt="logo" />
      <HomeTitle title={t('welcomeBack')} subTitle={t('welcome')} />
      <main>
        <div>{t('password')}</div>
        <Input
          onChange={onInputChange}
          onFocus={onInputChange}
          type={eyeStatus === 'close' ? 'password' : 'text'}
          width="w-full"
          bordered={true}
          errorMessage={errorMessage}
          suffix={eyeStatus === 'close' ? <EyeClose /> : <EyeOpen />}
          onSuffixClick={onSuffixClick}
        ></Input>
      </main>
      <Button fullWidth disabled={!!errorMessage} onClick={login}>
        {t('unlock')}
      </Button>
    </>
  )
}

export default UnlockPage
