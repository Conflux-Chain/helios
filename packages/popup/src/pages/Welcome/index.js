import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {LanguageNav, HomeTitle} from '../../components'
import Button from '@fluent-wallet/component-button'
import {ROUTES} from '../../constants'

const {SET_PASSWORD} = ROUTES
const Welcome = () => {
  const {t} = useTranslation()
  const navigate = useNavigate()

  return (
    <div
      className="bg-secondary h-full w-full flex flex-col bg-welcome-background"
      id="unlockContainer"
    >
      <LanguageNav showLan={false} />
      <header className="flex flex-col items-center pb-7 mt-7">
        <img
          src="/images/logo-vertical.svg"
          alt="logo"
          className="mx-auto w-50 h-40"
        />
        <HomeTitle
          title={t('welcomeToConflux')}
          containerStyle="text-center mt-[70px]"
        />
      </header>
      <main className="px-6 absolute left-0 right-0 bottom-0">
        <div className="flex flex-col h-full justify-between">
          <section className="mb-15">
            <Button
              id="welcomeBtn"
              className="mt-80 w-70 mx-auto"
              onClick={() => {
                navigate(SET_PASSWORD)
              }}
            >
              {t('create')}
            </Button>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Welcome
