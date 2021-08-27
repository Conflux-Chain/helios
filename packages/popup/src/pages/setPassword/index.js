import {useTranslation} from 'react-i18next'
import {LanguageNav, HomeTitle} from '../../components'
import PasswordForm from './components/PasswordForm.js'
const SetPassword = () => {
  const {t} = useTranslation()

  return (
    <>
      <LanguageNav hasGoBack={true} />
      <header>
        <HomeTitle title={t('hello')} subTitle={t('welcome')} />
      </header>
      <main>
        <PasswordForm />
      </main>
    </>
  )
}

export default SetPassword
