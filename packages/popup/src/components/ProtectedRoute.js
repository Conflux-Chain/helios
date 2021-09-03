import React from 'react'
import {Route, Redirect} from 'react-router-dom'
import {getAuth} from '../utils/index'

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({children, hasAccount, isLocked, ...rest}) => {
  return (
    <Route
      {...rest}
      render={() => {
        const to = getAuth(hasAccount, isLocked)
        return !to ? children : <Redirect to={to} />
      }}
    />
  )
}

export default ProtectedRoute
