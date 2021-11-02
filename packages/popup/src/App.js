import {ErrorBoundary} from 'react-error-boundary'
import {isUndefined} from '@fluent-wallet/checks'
import React, {lazy, Suspense} from 'react'
import {HashRouter as Router, Redirect, Route, Switch} from 'react-router-dom'
import {useIsLocked, useIsZeroGroup, usePendingAuthReq} from './hooks/useApi'
import {ProtectedRoute} from './components'
import {ROUTES} from './constants'
import './index.css'
import useGlobalStore from './stores/index.js'

const {
  HOME,
  WALLET_UNLOCK,
  WELCOME,
  CURRENT_SEED_PHRASE,
  NEW_SEED_PHRASE,
  BACKUP_SEED_PHRASE,
  CONFIRM_SEED_PHRASE,
  SET_PASSWORD,
  SELECT_CREATE_TYPE,
  IMPORT_SEED_PHRASE,
  WALLET_IMPORT_PRIVATE_KEY,
  ERROR,
  CONNECT_SITE,
  CONFIRM_ADD_SUGGESTED_TOKEN,
  REQUEST_SIGNATURE,
  DAPP_ADD_NETWORK,
  DAPP_SWITCH_NETWORK,
  SEND_TRANSACTION,
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
const RequestSignature = lazy(() => import('./pages/RequestSignature'))
const DappAddNetwork = lazy(() => import('./pages/DappAddNetwork'))
const DappSwitchNetwork = lazy(() => import('./pages/DappSwitchNetwork'))
const ConfirmAddSuggestedToken = lazy(() =>
  import('./pages/ConfirmAddSuggestedToken'),
)
const SendTransaction = lazy(() => import('./pages/SendTransaction'))

function App() {
  const lockedData = useIsLocked()
  const zeroGroup = useIsZeroGroup()
  const pendingAuthReq = usePendingAuthReq(lockedData === false)
  const {setFatalError} = useGlobalStore()

  if (
    isUndefined(lockedData) ||
    isUndefined(zeroGroup) ||
    (!lockedData && isUndefined(pendingAuthReq))
  ) {
    return <div>loading...</div>
  }
  return (
    <ErrorBoundary
      FallbackComponent={ErrorPage}
      onError={error => setFatalError(error)}
    >
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            loading
          </div>
        }
      >
        <div className="h-150 w-93 m-auto light">
          <Router>
            <Switch>
              <Route exact path={WALLET_UNLOCK} component={Unlock} />
              <Route exact path={WELCOME} component={Welcome} />
              <ProtectedRoute
                pendingAuthReq={pendingAuthReq}
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
              <Route
                exact
                path={IMPORT_SEED_PHRASE}
                component={ImportSeedPhrase}
              />
              <Route
                exact
                path={WALLET_IMPORT_PRIVATE_KEY}
                component={ImportPrivateKey}
              />
              <ProtectedRoute
                pendingAuthReq={pendingAuthReq}
                hasAccount={!zeroGroup}
                isLocked={!zeroGroup && lockedData}
                exact
                path={SEND_TRANSACTION}
                component={SendTransaction}
              />
              <Route exact path={SET_PASSWORD} component={SetPassword} />
              <Route
                exact
                path={SELECT_CREATE_TYPE}
                component={SelectCreateType}
              />
              <Route exact path={CONNECT_SITE} component={ConnectSite} />
              <Route
                exact
                path={CONFIRM_ADD_SUGGESTED_TOKEN}
                component={ConfirmAddSuggestedToken}
              />
              <Route
                exact
                path={REQUEST_SIGNATURE}
                component={RequestSignature}
              />
              <Route
                exact
                path={DAPP_SWITCH_NETWORK}
                component={DappSwitchNetwork}
              />
              <Route exact path={DAPP_ADD_NETWORK} component={DappAddNetwork} />
              <Route exact path={ERROR} component={ErrorPage} />
              <Route path="*" render={() => <Redirect to={ERROR} />} />
            </Switch>
          </Router>
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
