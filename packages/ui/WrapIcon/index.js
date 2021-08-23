import React from 'react'
import PropTypes from 'prop-types'
import CircleBg from './assets/CircleBg'
import SquareBg from './assets/SquareBg'

function WrapIcon({
  type,
  size = 'w-4 h-4',
  children,
  className = '',
  onClick,
  clickable = true,
  ...props
}) {
  return (
    <div
      data-testid="wrap-icon-test-id"
      onClick={e => onClick && onClick(e)}
      aria-hidden="true"
      className={`${size} relative flex justify-center items-center ${
        clickable ? 'cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {type === 'circle' && (
        <CircleBg className={size} data-testid="circle-id" />
      )}
      {type === 'square' && (
        <SquareBg className={size} data-testid="square-id" />
      )}
      <div
        className={`${size} absolute inset-0 flex justify-center items-center text-gray-40`}
      >
        {children}
      </div>
    </div>
  )
}

export default WrapIcon

WrapIcon.propTypes = {
  type: PropTypes.oneOf(['circle', 'square']).isRequired,
  size: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  clickable: PropTypes.bool,
}
