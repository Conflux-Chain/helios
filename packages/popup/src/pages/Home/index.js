import Button from '@fluent-wallet/component-button'
import {useTranslation} from 'react-i18next'
import {HomeNav} from '../../components'
import {
  CurrentAccount,
  CurrentNetwork,
  CurrentDapp,
  TokenList,
} from './components'

function Home() {
  const {t} = useTranslation()
  return (
    <div className="flex flex-col bg-bg h-full relative">
      <button onClick={() => open(location.href)} className="z-10 text-white">
        open
      </button>
      <img src="images/home-bg.svg" alt="home" className="absolute top-0 z-0" />
      <HomeNav />
      <div className="flex flex-col pt-1 px-4 z-10">
        <div className="flex items-start justify-between">
          <CurrentAccount />
          <CurrentNetwork />
        </div>
        <div className="flex mt-3 mb-4">
          <Button
            size="small"
            variant="outlined"
            className="!border-white !text-white !bg-transparent !hover:none mr-2"
          >
            {t('send')}
          </Button>
          <Button
            size="small"
            variant="outlined"
            className="!border-white !text-white !bg-transparent !hover:none"
          >
            {t('history')}
          </Button>
        </div>
      </div>
      <TokenList />
      <CurrentDapp />
    </div>
  )
}

export default Home
