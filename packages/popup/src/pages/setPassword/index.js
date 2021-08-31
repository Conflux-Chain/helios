import {useTranslation} from 'react-i18next'
import {LanguageNav, HomeTitle} from '../../components'
import SetPasswordForm from './components/SetPasswordForm'

const SetPassword = () => {
  const {t} = useTranslation()

  return (
    <div className="bg-secondary h-full">
      <LanguageNav hasGoBack={true} />
      <header>
        <HomeTitle title={t('hello')} subTitle={t('welcome')} />
      </header>
      <main className="px-3 ">
        <SetPasswordForm
          formStyle="bg-white mt-4 rounded px-4 pt-8 pb-18 relative h-88"
          legendStyle="text-gray-40 text-sm mb-3"
          desStyle="text-xs not-italic text-center absolute top-78 -translate-x-2/4 left-1/2 w-fit text-gray-40"
          buttonStyle="absolute w-70 top-86 -translate-x-2/4 left-1/2"
        />
      </main>
    </div>
  )
}

export default SetPassword
