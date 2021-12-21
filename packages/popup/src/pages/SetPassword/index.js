import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {LanguageNav, HomeTitle} from '../../components'
import SetPasswordForm from './components/SetPasswordForm'

const SetPassword = () => {
  const {t} = useTranslation()
  const history = useHistory()

  return (
    <div
      className="bg-secondary h-150 w-93 m-auto light flex flex-col"
      id="setPasswordContainer"
    >
      <LanguageNav
        hasGoBack={true}
        onClickBack={() => {
          history.goBack()
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
