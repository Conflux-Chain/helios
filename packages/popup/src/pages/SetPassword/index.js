import {useTranslation} from 'react-i18next'
import {LanguageNav, HomeTitle} from '../../components'
import {SetPasswordForm} from './components'

const SetPassword = () => {
  const {t} = useTranslation()

  return (
    <div
      className="bg-secondary h-full flex flex-col"
      id="setPasswordContainer"
    >
      <LanguageNav hasGoBack={true} />
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
