import React, {lazy, Suspense, useEffect, useState} from 'react'
import {HashRouter as Router, Route, Switch, Redirect} from 'react-router-dom'
import {ProtectedRoute} from './components'
import {GET_ALL_ACCOUNT_GROUP, GET_WALLET_STATUS} from './constants'
import {useRPC} from '@fluent-wallet/use-rpc'
import './index.css'

const HomePage = lazy(() => import('./pages/Home'))
const ConfirmSeed = lazy(() => import('./pages/CreateSeed/ConfirmSeed'))
const NewSeed = lazy(() => import('./pages/CreateSeed/NewSeed'))
const Unlock = lazy(() => import('./pages/Unlock'))
const Welcome = lazy(() => import('./pages/Welcome'))
const SetPassword = lazy(() => import('./pages/SetPassword'))
const SelectCreateType = lazy(() => import('./pages/SelectCreateType'))
const ImportSeedPhrase = lazy(() => import('./pages/ImportSeedPhrase'))
const ImportPrivateKey = lazy(() => import('./pages/ImportPrivateKey'))
const BackupSeed = lazy(() => import('./pages/CreateSeed/BackupSeed'))
const CurrentSeed = lazy(() => import('./pages/CurrentSeed'))
const ErrorPage = lazy(() => import('./pages/Error'))

function App() {
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [errorStatus, setErrorStatus] = useState(false)

  const [accountAvailability, setAccountAvailability] = useState(false)
  const [lockStatus, setLockStatus] = useState(true)

  const {data: accountGroups, error: accountError} = useRPC([
    ...GET_ALL_ACCOUNT_GROUP,
  ])
  const {data: lockData, error: lockError} = useRPC([...GET_WALLET_STATUS])

  useEffect(() => {
    if (accountError || lockError) {
      setLoadingStatus(false)
      setErrorStatus(true)
      return
    }
    if (accountGroups !== undefined && lockData !== undefined) {
      setAccountAvailability(!!accountGroups.length)
      setLockStatus(lockData)
      setLoadingStatus(false)
    }
  }, [accountGroups, accountError, lockData, lockError])

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center"></div>
      }
    >
      <div className="h-150 w-93 m-auto light">
        {loadingStatus ? null : errorStatus ? (
          <ErrorPage />
        ) : (
          <Router>
            <Switch>
              <Route exact path="/unlock">
                <Unlock />
              </Route>
              <Route exact path="/welcome">
                <Welcome />
              </Route>

              <ProtectedRoute
                hasAccount={accountAvailability}
                isLocked={lockStatus}
                exact
                path="/"
              >
                <HomePage />
              </ProtectedRoute>
              <Route exact path="/current-seed-phrase">
                <CurrentSeed />
              </Route>
              <Route exact path="/new-seed-phrase">
                <NewSeed />
              </Route>
              <Route exact path="/backup-seed-phrase">
                <BackupSeed />
              </Route>
              <Route exact path="/confirm-seed-phrase">
                <ConfirmSeed />
              </Route>

              <Route exact path="/set-password">
                <SetPassword />
              </Route>
              <Route exact path="/select-create-type">
                <SelectCreateType />
              </Route>
              <Route exact path="/import-seed-phrase">
                <ImportSeedPhrase />
              </Route>
              <Route exact path="/import-private-key">
                <ImportPrivateKey />
              </Route>
              <Route exact path="/error">
                <ErrorPage />
              </Route>
              <Route path="*">
                <Redirect to="/error" />
              </Route>
            </Switch>
          </Router>
        )}
      </div>
    </Suspense>
  )
}

export default App
