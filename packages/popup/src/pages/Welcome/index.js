import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {LanguageNav, HomeTitle} from '../../components'
import Button from '@fluent-wallet/component-button'
import {ROUTES} from '../../constants'

const {SET_PASSWORD} = ROUTES
const Welcome = () => {
  const {t} = useTranslation()
  const history = useHistory()
  return (
    <div className="bg-secondary h-full w-full" id="welcomeContainer">
      <LanguageNav showLan={false} />
      <div className="h-13" />
      <header className="mt-8">
        <HomeTitle title={t('hello')} subTitle={t('welcome')} />
      </header>
      <main>
        <Button
          id="welcomeBtn"
          className="mt-80 w-70 mx-auto"
          onClick={() => {
            history.push(SET_PASSWORD)
          }}
        >
          {t('create')}
        </Button>
      </main>
    </div>
  )
}

export default Welcome
