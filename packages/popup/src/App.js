import React from 'react'
import './App.css'
import './index.css'
import {useRPC} from '@cfxjs/use-rpc'
// import {Alert} from '../../ui-components/components'
function App() {
  const a = useRPC('wallet_generateMnemonic')
  const b = useRPC('wallet_generatePrivateKey')

  console.log('data = ', a, b)
  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => open(location.href)}>open</button>
        <p className="p-9">
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
      {/* <Alert
        open={true}
        type="warning"
        closable={false}
        content="6666"
        width="w-full"
      /> */}
    </div>
  )
}

export default App
