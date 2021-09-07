import PropTypes from 'prop-types'
import {Route, Redirect} from 'react-router-dom'
import {getRouteWithAuthInfo} from '../utils'

const ProtectedRoute = ({children, hasAccount, isLocked, ...rest}) => {
  return (
    <Route
      {...rest}
      render={() => {
        const to = getRouteWithAuthInfo(hasAccount, isLocked)
        return !to ? children : <Redirect to={to} />
      }}
    />
  )
}

ProtectedRoute.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  hasAccount: PropTypes.bool,
  isLocked: PropTypes.bool,
}

export default ProtectedRoute
