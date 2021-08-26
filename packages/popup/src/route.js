import {lazy} from 'react'

const HomePage = lazy(() => import('./pages/Home'))
const ConfirmSeed = lazy(() => import('./pages/ConfirmSeed'))
const CreateAccount = lazy(() => import('./pages/CreateAccount'))
const NewSeed = lazy(() => import('./pages/NewSeed'))
const WithCurrentSeed = lazy(() => import('./pages/WithCurrentSeed'))

const routes = [
  {
    path: '/',
    component: HomePage,
    exact: true,
  },
  {
    exact: true,
    path: '/create-account',
    component: CreateAccount,
  },
  {
    path: '/create-account/import-seed-phase',
    component: WithCurrentSeed,
    exact: true,
  },
  {
    path: '/create-account/new-seed-phrase',
    component: NewSeed,
    exact: true,
  },
  {
    path: '/create-account/confirm-seed-phrase',
    component: ConfirmSeed,
    exact: true,
  },
  {
    path: '*',
    // TODO: Replace with no match page
    component: HomePage,
  },
]

export default routes
