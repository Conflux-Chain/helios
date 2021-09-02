import React, {lazy, Suspense} from 'react'
import {HashRouter as Router, Route, Switch, Redirect} from 'react-router-dom'
import {ProtectedRoute} from './components'
import './index.css'

const HomePage = lazy(() => import('./pages/Home'))
const ConfirmSeed = lazy(() => import('./pages/CreateSeed/ConfirmSeed'))
const CreateAccount = lazy(() => import('./pages/CreateAccount'))
const NewSeed = lazy(() => import('./pages/CreateSeed/NewSeed'))
const BackupSeed = lazy(() => import('./pages/CreateSeed/BackupSeed'))
const CurrentSeed = lazy(() => import('./pages/CurrentSeed'))
import create from './hooks/zustand'

const useStore = create(
  set => ({
    isLocked: false,
    hasAccount: false,
    groupFetching: true,
    lockedFetching: true,
    groupAfterSet: ({groupData, groupError}) => {
      if (groupError) {
        set({groupFetching: false})
      }
      if (groupData !== Symbol.for('group')) {
        set({hasAccount: !!groupData.length, groupFetching: false})
      }
    },
    lockedAfterSet: ({lockedData, lockedError}) => {
      if (lockedError) {
        set({lockedFetching: false})
      }
      if (lockedData !== Symbol.for('locked')) {
        set({isLocked: lockedData, lockedFetching: false})
      }
    },
  }),
  {
    group: {
      deps: 'wallet_getAccountGroup',
      opts: {fallbackData: Symbol.for('group')},
    },
    locked: {
      deps: 'wallet_isLocked',
      opts: {fallbackData: Symbol.for('locked')},
    },
  },
)

function App() {
  const {isLocked, groupFetching, lockedFetching, hasAccount} = useStore()

  if (lockedFetching || groupFetching) {
    return null
  }

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
            <ProtectedRoute
              exact
              path="/"
              isLocked={isLocked}
              hasAccount={hasAccount}
            >
              <HomePage />
            </ProtectedRoute>
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
