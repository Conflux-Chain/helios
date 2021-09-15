import PropTypes from 'prop-types'
import {Redirect, Route} from 'react-router-dom'
import useGlobalStore from '../stores/index.js'
import {getRouteWithAuthInfo} from '../utils'

const ProtectedRoute = ({children, hasAccount, isLocked, ...rest}) => {
  const {FATAL_ERROR} = useGlobalStore()

  if (FATAL_ERROR)
    return (
      <Route>
        <Redirect to="/error" />
      </Route>
    )

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
