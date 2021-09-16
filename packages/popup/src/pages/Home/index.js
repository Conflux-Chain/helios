import {useState} from 'react'
import {AccountList, NetworkList, ActionSheet} from './components'
import {useQuery} from '../../hooks/'
import {useEffectOnce} from 'react-use'
import {useHistory} from 'react-router-dom'

const HomePage = () => {
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
    <div className="App h-full relative overflow-hidden">
      <header className="App-header">
        <button onClick={() => open(location.href)}>open</button>
        <button onClick={() => setAccountStatus(true)}>open my accounts</button>
        <button onClick={() => setNetworkStatus(true)}>
          open my NetworkList
        </button>
        <p className="p-9">
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
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

export default HomePage
