import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {LanguageNav, HomeTitle} from '../../components'
import Button from '@cfxjs/component-button'

const Welcome = () => {
  const {t} = useTranslation()
  const history = useHistory()
  return (
    <div className="bg-secondary h-full">
      <LanguageNav hasGoBack={false} />
      <header>
        <HomeTitle title={t('hello')} subTitle={t('welcome')} />
      </header>
      <main className="px-12.5">
        <Button
          fullWidth
          className="mt-85"
          onClick={() => {
            history.push('/set-password')
          }}
        >
          {t('create')}
        </Button>
      </main>
    </div>
  )
}

export default Welcome
