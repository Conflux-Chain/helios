import React, {Suspense} from 'react'
import './index.css'
import {useRPC} from '@cfxjs/use-rpc'
import routes from './route.js'
import {HashRouter as Router, Switch} from 'react-router-dom'
import {RouteWithSubRoutes} from './components'
function App() {
  const a = useRPC('wallet_generateMnemonic')
  const b = useRPC('wallet_generatePrivateKey')

  console.log('data = ', a, b)

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          loading...
        </div>
      }
    >
      <Router>
        <Switch>
          {routes.map((route, i) => (
            <RouteWithSubRoutes key={i} {...route} />
          ))}
        </Switch>
      </Router>
    </Suspense>
  )
}

export default App
