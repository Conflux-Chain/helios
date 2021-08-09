import React, {useMemo} from 'react'
import PropTypes from 'prop-types'
function Button({
  onClick,
  className = '',
  children,
  size = 'medium',
  color = 'primary',
  variant = 'contained',
  disabled = false,
  fullWidth = false,
  danger = false,
  startIcon,
  endIcon,
  ...props
}) {
  const disabledStyle = useMemo(() => {
    if (disabled) {
      if (variant === 'text')
        return 'bg-transparent text-gray-40 cursor-not-allowed'
      else return 'bg-gray-20 text-gray-40 cursor-not-allowed'
    }
    return ''
  }, [disabled, variant])

  const colorStyle = useMemo(() => {
    if (disabled) return ''
    if (variant === 'text') {
      if (danger) return 'text error bg-transparent hover:bg-error-10'
      if (color === 'primary')
        return 'text-gray-80 bg-transparent hover:bg-gray-10'
    } else if (variant === 'outlined') {
      if (danger)
        return 'border border-error text-error bg-gray-0 hover:border-error-dark hover:text-error-dark'
      if (color === 'primary')
        return 'border border-primary text-primary bg-gray-0 hover:border-primary-dark hover:text-primary-dark'
    } else if (variant === 'contained') {
      if (danger) return 'text-white bg-error hover:bg-error-dark'
      if (color === 'primary')
        return 'text-white bg-primary hover:bg-primary-dark'
    }
    return ''
  }, [disabled, variant, color, danger])

  const sizeStyle = useMemo(() => {
    if (size === 'large') return 'text-base h-12'
    if (size === 'medium') return 'text-sm h-10'
    if (size === 'small') return 'text-xs h-8'
    return ''
  }, [size])

  const iconColor = useMemo(() => {
    if (disabled) return 'text-gray-40'
    if (variant === 'contained') return 'text-white'
    return 'text-primary hover:text-primary-dark'
  }, [disabled, variant])

  const iconSize = useMemo(() => {
    if (size === 'large') return 'w-5 h-5'
    if (size === 'medium') return 'w-4 h-4'
    if (size === 'small') return 'w-3 h-3'
  }, [size])

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
    <button
      onClick={e => onClick && onClick(e)}
      disabled={disabled}
      className={`
      flex justify-center items-center focus:outline-none rounded ${disabledStyle} ${colorStyle} ${sizeStyle} ${
        fullWidth ? 'w-full' : 'px-4'
      } ${className}`}
      {...props}
    >
      {startIconComp}
      {children}
      {endIconComp}
    </button>
  )
}

Button.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
  variant: PropTypes.string,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  danger: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
}

export default Button
