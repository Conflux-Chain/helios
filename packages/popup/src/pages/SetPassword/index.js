import {useNavigate} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {LanguageNav, HomeTitle} from '../../components'
import SetPasswordForm from './components/SetPasswordForm'

const SetPassword = () => {
  const {t} = useTranslation()
  const navigate = useNavigate()

  return (
    <div
      className="bg-secondary h-full w-full flex flex-col bg-welcome-background"
      id="setPasswordContainer"
    >
      <LanguageNav
        showLan={false}
        hasGoBack={true}
        onClickBack={() => {
          navigate(-1)
        }}
      />
      <header className="mt-8 mb-4">
        <HomeTitle title={t('hello')} subTitle={t('welcome')} />
      </header>
      <main className="px-3 flex-1 mb-4 border-box">
        <SetPasswordForm />
      </main>
    </div>
  )
}

export default SetPassword
