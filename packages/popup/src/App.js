import {isUndefined} from '@fluent-wallet/checks'
import {useRPC} from '@fluent-wallet/use-rpc'
import React, {lazy, Suspense, useEffect} from 'react'
import {HashRouter as Router, Redirect, Route, Switch} from 'react-router-dom'
import {ProtectedRoute} from './components'
import {
  GET_ALL_ACCOUNT_GROUP,
  GET_NO_GROUP,
  GET_WALLET_STATUS,
} from './constants'
import './index.css'
import useGlobalStore from './stores/index.js'

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
  const {data: lockedData, error: lockedError} = useRPC([...GET_WALLET_STATUS])
  const {data: zeroGroup, error: zeroGroupError} = useRPC([...GET_NO_GROUP])
  const {error: getAccountGroupError} = useRPC(
    lockedData === false ? [...GET_ALL_ACCOUNT_GROUP] : null,
  )
  const {setFatalError} = useGlobalStore()

  useEffect(() => {
    if (lockedError) setFatalError(lockedError)
    if (zeroGroupError) setFatalError(zeroGroupError)
    if (getAccountGroupError) setFatalError(getAccountGroupError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedError || zeroGroupError || getAccountGroupError])

  if (isUndefined(lockedData) || isUndefined(zeroGroup))
    return <div>loading...</div>

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center"></div>
      }
    >
      <div className="h-150 w-93 m-auto light">
        <Router>
          <Switch>
            <Route exact path="/unlock">
              <Unlock />
            </Route>
            <Route exact path="/welcome">
              <Welcome />
            </Route>

            <ProtectedRoute
              hasAccount={!zeroGroup}
              isLocked={!zeroGroup && lockedData}
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
      </div>
    </Suspense>
  )
}

export default App
