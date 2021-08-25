import {useTranslation} from 'react-i18next'
import {LanguageNav, HomeTitle} from '../../components'
import Button from '@cfxjs/component-button'

const Welcome = () => {
  const {t} = useTranslation()
  const setPassword = () => {}
  return (
    <>
      <LanguageNav hasGoBack={false} />
      <HomeTitle title={t('hello')} subTitle={t('welcome')} />
      <main>
        <Button fullWidth onClick={setPassword}>
          {t('create')}
        </Button>
        <Button fullWidth disabled>
          {t('migration')}
        </Button>
      </main>
    </>
  )
}

export default Welcome
