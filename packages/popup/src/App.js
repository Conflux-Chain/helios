import {isUndefined} from '@fluent-wallet/checks'
import {useRPC} from '@fluent-wallet/use-rpc'
import React, {lazy, Suspense, useEffect} from 'react'
import {HashRouter as Router, Redirect, Route, Switch} from 'react-router-dom'
import {ProtectedRoute} from './components'
import {RPC_METHODS, ROUTES} from './constants'
import './index.css'
import useGlobalStore from './stores/index.js'
const {GET_ACCOUNT_GROUP, GET_NO_GROUP, GET_WALLET_LOCKED_STATUS} = RPC_METHODS

const {
  HOME,
  UNLOCK,
  WELCOME,
  CURRENT_SEED_PHRASE,
  NEW_SEED_PHRASE,
  BACKUP_SEED_PHRASE,
  CONFIRM_SEED_PHRASE,
  SET_PASSWORD,
  SELECT_CREATE_TYPE,
  IMPORT_SEED_PHRASE,
  IMPORT_PRIVATE_KEY,
  ERROR,
  CONNECT_SITE,
} = ROUTES
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
const ConnectSite = lazy(() => import('./pages/ConnectSite'))

function App() {
  const {data: lockedData, error: lockedError} = useRPC([
    GET_WALLET_LOCKED_STATUS,
  ])
  const {data: zeroGroup, error: zeroGroupError} = useRPC([GET_NO_GROUP])
  const {error: getAccountGroupError} = useRPC(
    lockedData === false ? [GET_ACCOUNT_GROUP] : null,
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
            <Route exact path={UNLOCK} component={Unlock} />
            <Route exact path={WELCOME} component={Welcome} />

            <ProtectedRoute
              hasAccount={!zeroGroup}
              isLocked={!zeroGroup && lockedData}
              exact
              path={HOME}
              component={HomePage}
            />
            <Route exact path={CURRENT_SEED_PHRASE} component={CurrentSeed} />
            <Route exact path={NEW_SEED_PHRASE} component={NewSeed} />
            <Route exact path={BACKUP_SEED_PHRASE} component={BackupSeed} />
            <Route exact path={CONFIRM_SEED_PHRASE} component={ConfirmSeed} />
            <Route exact path={SET_PASSWORD} component={SetPassword} />
            <Route
              exact
              path={SELECT_CREATE_TYPE}
              component={SelectCreateType}
            />
            <Route
              exact
              path={IMPORT_SEED_PHRASE}
              component={ImportSeedPhrase}
            />
            <Route
              exact
              path={IMPORT_PRIVATE_KEY}
              component={ImportPrivateKey}
            />
            <Route exact path={ERROR} component={ErrorPage} />
            <ProtectedRoute
              hasAccount={!zeroGroup}
              isLocked={!zeroGroup && lockedData}
              exact
              path={CONNECT_SITE}
              component={ConnectSite}
            />
            <Route path="*" render={() => <Redirect to={ERROR} />} />
          </Switch>
        </Router>
      </div>
    </Suspense>
  )
}

export default App
