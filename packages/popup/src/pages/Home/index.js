import Button from '@fluent-wallet/component-button'
import {useTranslation} from 'react-i18next'
import {HomeNav} from '../../components'
import {CurrentAccount, CurrentNetwork, TokenList} from './components'

function Home() {
  const {t} = useTranslation()
  const onLock = () => {}
  return (
    <div className="flex flex-col bg-bg h-full">
      <button onClick={() => open(location.href)}>open</button>
      <HomeNav onLock={onLock} />
      <div className="flex flex-col pt-1 px-4 bg-secondary">
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
      <div className="flex h-16 rounded-t-xl bg-gray-0"></div>
    </div>
  )
}

export default Home
