import {useState} from 'react'
import {AccountList} from './components'
const HomePage = () => {
  const [accountStatus, setAccountStatus] = useState(false)
  return (
    <div className="App h-full relative overflow-hidden">
      <header className="App-header">
        <button onClick={() => open(location.href)}>open</button>
        <button onClick={() => setAccountStatus(true)}>open my accounts</button>
        <p className="p-9">
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
      <div>
        <AccountList
          close={() => setAccountStatus(false)}
          accountStatus={accountStatus}
        />
      </div>
    </div>
  )
}

export default HomePage
