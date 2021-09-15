import {useState} from 'react'
import {AccountList, NetworkList, ActionSheet} from './components'

const HomePage = () => {
  const [accountStatus, setAccountStatus] = useState(false)
  const [networkStatus, setNetworkStatus] = useState(false)

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
