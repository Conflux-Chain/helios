import {useTranslation} from 'react-i18next'
// import Button from '@fluent-wallet/component-button'
import {
  TitleNav,
  CurrentAccountDisplay,
  CurrentNetworkDisplay,
} from '../../components'

function Home() {
  const {t} = useTranslation()

  return (
    <div className="flex flex-col h-full relative">
      <img
        src="images/send-transaction-bg.svg"
        alt="top"
        className="absolute top-0"
      />
      <TitleNav title={t('sendTransaction')} />
      <div className="flex mt-1 mb-3 mx-4 justify-between items-center z-20">
        <CurrentAccountDisplay />
        <CurrentNetworkDisplay />
      </div>
      <div className="flex flex-1 flex-col justify-between rounded-t-xl bg-gray-0 px-3 py-4"></div>
    </div>
  )
}

export default Home
