import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {LanguageNav, HomeTitle} from '../../components'
import Button from '@cfxjs/component-button'

const Welcome = () => {
  const {t} = useTranslation()
  const history = useHistory()
  return (
    <>
      <LanguageNav hasGoBack={false} />
      <HomeTitle title={t('hello')} subTitle={t('welcome')} />
      <main>
        <Button
          fullWidth
          onClick={() => {
            history.push('/set-password')
          }}
        >
          {t('create')}
        </Button>
      </main>
    </>
  )
}

export default Welcome
