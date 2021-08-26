import React, {Suspense} from 'react'
import {useRPC} from '@cfxjs/use-rpc'
import {HashRouter as Router, Route, Switch, Redirect} from 'react-router-dom'
import {lazy} from 'react'
import './index.css'

const HomePage = lazy(() => import('./pages/Home'))
const ConfirmSeed = lazy(() => import('./pages/ConfirmSeed'))
const CreateAccount = lazy(() => import('./pages/CreateAccount'))
const NewSeed = lazy(() => import('./pages/NewSeed'))
const BackupSeed = lazy(() => import('./pages/BackupSeed'))
const CurrentSeed = lazy(() => import('./pages/CurrentSeed'))

function App() {
  const {data: mnemonic} = useRPC('wallet_generateMnemonic')
  const {data: pk} = useRPC('wallet_generatePrivateKey')

  console.log('data = ', mnemonic, pk)

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
            <Route exact path="/create-account-default">
              <CreateAccount />
            </Route>
            <Route exact path="/create-account-current-seed-phrase">
              <CurrentSeed />
            </Route>
            <Route exact path="/create-account-new-seed-phrase">
              <NewSeed />
            </Route>
            <Route exact path="/create-account-backup-seed-phrase">
              <BackupSeed />
            </Route>
            <Route exact path="/create-account-confirm-seed-phrase">
              <ConfirmSeed />
            </Route>
            {/* TODO: Replace with 404 page */}
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
