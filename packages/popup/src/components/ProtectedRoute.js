import PropTypes from 'prop-types'
import {Redirect, Route} from 'react-router-dom'
import useGlobalStore from '../stores/index.js'
import {ROUTES, DAPP_REQUEST_ROUTES} from '../constants'
const {ERROR, UNLOCK, WELCOME} = ROUTES

const ProtectedRoute = ({pendingAuthReq, hasAccount, isLocked, ...rest}) => {
  const {FATAL_ERROR} = useGlobalStore()
  const hasPendingAuthReq = pendingAuthReq?.length > 0

  switch (true) {
    case FATAL_ERROR:
      return <Redirect to={{pathname: ERROR}} />
    case !hasAccount:
      return <Redirect to={{pathname: WELCOME}} />
    case isLocked:
      return <Redirect to={{pathname: UNLOCK}} />
    case hasPendingAuthReq:
      return (
        <Redirect
          to={{
            pathname:
              DAPP_REQUEST_ROUTES[pendingAuthReq[0]?.req?.method] || ERROR,
          }}
        />
      )
    // return <Redirect to={{pathname: PENDING_AUTH_REQ}} />
    default:
      return <Route {...rest} />
  }
}

ProtectedRoute.propTypes = {
  hasPendingAuthReq: PropTypes.bool,
  hasAccount: PropTypes.bool,
  isLocked: PropTypes.bool,
  pendingAuthReq: PropTypes.array,
}

export default ProtectedRoute
