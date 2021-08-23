import React, {useMemo} from 'react'
import PropTypes from 'prop-types'

const sizeStyleObj = {
  small: 'text-xs',
  medium: 'text-sm',
  large: 'text-base',
}

const iconSizeObj = {
  small: 'w-3 h-3',
  medium: 'w-4 h-4',
  large: 'w-5 h-5',
}

function Link({
  onClick,
  className = '',
  children,
  size = 'medium',
  disabled = false,
  startIcon,
  endIcon,
  ...props
}) {
  const disabledStyle = useMemo(() => {
    if (disabled) {
      return 'bg-transparent text-gray-40 cursor-not-allowed'
    }
    return ''
  }, [disabled])

  const colorStyle = useMemo(() => {
    if (disabled) return ''
    return 'text-primary bg-transparent hover:text-primary-dark hover:underline'
  }, [disabled])

  const sizeStyle = sizeStyleObj[size] || ''

  const iconColor = useMemo(() => {
    if (disabled) return 'text-gray-40'
    return 'text-primary hover:text-primary-dark'
  }, [disabled])

  const iconSize = iconSizeObj[size]

  const startIconComp = startIcon
    ? React.cloneElement(startIcon, {
        className: `mr-2 ${iconColor} ${iconSize} ${
          startIcon.props.className || ''
        }`,
      })
    : null

  const endIconComp = endIcon
    ? React.cloneElement(endIcon, {
        className: `ml-2 ${iconColor} ${iconSize} ${
          endIcon.props.className || ''
        }`,
      })
    : null

  return (
    <a
      data-testid="link-wrapper"
      aria-hidden="true"
      onClick={e => onClick && !disabled && onClick(e)}
      className={`
      flex justify-center items-center focus:outline-none rounded cursor-pointer ${disabledStyle} ${colorStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {startIconComp}
      {children}
      {endIconComp}
    </a>
  )
}

Link.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
}

export default Link
