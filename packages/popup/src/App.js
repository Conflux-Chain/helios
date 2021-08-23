import React, {Suspense} from 'react'
import './index.css'
// import {useRPC} from '@cfxjs/use-rpc'
import HomePage from './pages/Home'
import Unlock from './pages/Unlock'

import {HashRouter as Router, Route, Switch, Redirect} from 'react-router-dom'

function App() {
  // const a = useRPC('wallet_generateMnemonic')
  // const b = useRPC('wallet_generatePrivateKey')

  // console.log('data = ', a, b)
  return (
    <div className="h-160 w-95 m-auto">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            loading...
          </div>
        }
      >
        <Router>
          <Switch>
            <Route exact path="/">
              <HomePage />
            </Route>
            <Route exact path="/unlock">
              <Unlock />
            </Route>
            <Route path="*">
              <Redirect to="/" />
            </Route>
          </Switch>
        </Router>
      </Suspense>
    </div>
  )
}

export default App
