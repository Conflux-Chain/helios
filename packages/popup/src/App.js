import React from 'react'
import './App.css'
import './index.css'
import {useRPC} from '@cfxjs/use-rpc'
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
    </div>
  )
}

export default App
