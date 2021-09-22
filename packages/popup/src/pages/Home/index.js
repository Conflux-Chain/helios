import {useState} from 'react'
import {useQuery} from '../../hooks'
import {useEffectOnce} from 'react-use'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {HomeNav} from '../../components'
import {
  CurrentAccount,
  CurrentNetwork,
  CurrentDapp,
  TokenList,
  AccountList,
  NetworkList,
  ActionSheet,
} from './components'

function Home() {
  const {t} = useTranslation()
  const [accountStatus, setAccountStatus] = useState(false)
  const [networkStatus, setNetworkStatus] = useState(false)
  const query = useQuery()
  const history = useHistory()

  useEffectOnce(() => {
    if (query.get('open') === 'account-list') {
      history.replace('')
      setAccountStatus(true)
    }
  })
  return (
    <div className="flex flex-col bg-bg h-full">
      <button onClick={() => open(location.href)}>open</button>
      <HomeNav />
      <div className="flex flex-col pt-1 px-4 bg-secondary">
        <div className="flex items-start justify-between">
          <CurrentAccount showAccount={() => setAccountStatus(true)} />
          <CurrentNetwork showNetwork={() => setNetworkStatus(true)} />
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
      <ActionSheet
        title="myAccounts"
        close={() => setAccountStatus(false)}
        showActionSheet={accountStatus}
      >
        <AccountList />
      </ActionSheet>
      <ActionSheet
        title="network"
        close={() => setNetworkStatus(false)}
        showActionSheet={networkStatus}
      >
        <NetworkList />
      </ActionSheet>
    </div>
  )
}

export default Home
