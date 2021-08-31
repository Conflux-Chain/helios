import React from 'react'
import PropTypes from 'prop-types'
import LoadingSvg from './assets/Loading'

function Loading({className = ''}) {
  return (
    <LoadingSvg
      data-testid="loading-wrapper"
      className={`animate-spin text-gray-20 w-12 h-12 ${className}`}
    />
  )
}

export default Loading

Loading.propTypes = {
  className: PropTypes.string,
}
