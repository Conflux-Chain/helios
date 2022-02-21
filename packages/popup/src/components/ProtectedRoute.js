import PropTypes from 'prop-types'
import {Redirect, Route} from 'react-router-dom'
import useGlobalStore from '../stores/index.js'
import {getPageType} from '../utils'

import {ROUTES, DAPP_REQUEST_ROUTES} from '../constants'
const {ERROR, WALLET_UNLOCK, WELCOME} = ROUTES

const ProtectedRoute = ({hasAccount, isLocked, pendingAuthReq, ...rest}) => {
  const {FATAL_ERROR} = useGlobalStore()
  const isDapp = getPageType() === 'notification'
  const hasPendingAuthReq = pendingAuthReq?.length > 0

  switch (true) {
    case FATAL_ERROR:
      return <Redirect to={{pathname: ERROR, search: `?from=home`}} />
    case !hasAccount:
      return <Redirect to={{pathname: WELCOME}} />
    case isLocked:
      return <Redirect to={{pathname: WALLET_UNLOCK}} />
    case isDapp && hasPendingAuthReq:
      // eslint-disable-next-line no-case-declarations
      const path = DAPP_REQUEST_ROUTES[pendingAuthReq[0]?.req?.method]
      return (
        <Redirect
          to={{
            pathname: path || ERROR,
            search: `?from=home`,
            state: {params: path ? pendingAuthReq[0]?.req?.params : undefined},
          }}
        />
      )
    default:
      return <Route {...rest} />
  }
}

ProtectedRoute.propTypes = {
  hasAccount: PropTypes.bool,
  isLocked: PropTypes.bool,
  pendingAuthReq: PropTypes.array,
}

export default ProtectedRoute
