import {useTranslation} from 'react-i18next'
import {LanguageNav, HomeTitle} from '../../components'
import SetPasswordForm from './components/SetPasswordForm'
const SetPassword = () => {
  const {t} = useTranslation()

  return (
    <>
      <LanguageNav hasGoBack={true} />
      <HomeTitle title={t('hello')} subTitle={t('welcome')} />
      <SetPasswordForm />
    </>
  )
}

export default SetPassword
