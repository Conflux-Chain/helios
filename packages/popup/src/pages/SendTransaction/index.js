import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {useRPC} from '@fluent-wallet/use-rpc'
// import Button from '@fluent-wallet/component-button'
import {TitleNav, CurrentNetworkDisplay} from '../../components'
import {
  ToAddressInput,
  TokenAndAmount,
  CurrentAccountDisplay,
} from './components'
import {RPC_METHODS} from '../../constants'
const {GET_CURRENT_NETWORK} = RPC_METHODS

function Home() {
  const {t} = useTranslation()
  const [address, setAddress] = useState('')
  const [selectedToken, seSelectedToken] = useState({})
  const {data: currentNetwork} = useRPC([GET_CURRENT_NETWORK], undefined, {
    fallbackData: {},
  })
  useEffect(() => {
    console.log('network: ', currentNetwork)
    const {ticker} = currentNetwork
    if (ticker) seSelectedToken(ticker)
  }, [Boolean(currentNetwork)])
  return (
    <div className="flex flex-col h-full relative bg-bg">
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
      <div className="flex flex-1 flex-col justify-between rounded-t-xl bg-gray-0 px-3 py-4">
        <div className="flex flex-col">
          <ToAddressInput address={address} onChangeAddress={setAddress} />
          <TokenAndAmount selectedToken={selectedToken} amount="12345" />
        </div>
      </div>
    </div>
  )
}

export default Home
