import {useTranslation} from 'react-i18next'
import {LanguageNav, HomeTitle} from '../../components'
import SetPasswordForm from './components/SetPasswordForm'

const SetPassword = () => {
  const {t} = useTranslation()

  return (
    <>
      <LanguageNav hasGoBack={true} />
      <header>
        <HomeTitle title={t('hello')} subTitle={t('welcome')} />
      </header>
      <main>
        <SetPasswordForm />
      </main>
    </>
  )
}

export default SetPassword
