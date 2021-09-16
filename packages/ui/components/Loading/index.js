import React from 'react'
import PropTypes from 'prop-types'
import {LoadingOutlined} from '@fluent-wallet/component-icons'

function Loading({className = ''}) {
  return (
    <LoadingOutlined
      data-testid="loading-wrapper"
      className={`animate-spin text-gray-20 w-12 h-12 ${className}`}
    />
  )
}

export default Loading

Loading.propTypes = {
  className: PropTypes.string,
}
