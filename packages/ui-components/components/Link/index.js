import React, {useMemo} from 'react'
import PropTypes from 'prop-types'

function CustomLink({
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

  const sizeStyle = useMemo(() => {
    if (size === 'large') return 'text-base '
    if (size === 'medium') return 'text-sm'
    if (size === 'small') return 'text-xs'
    return ''
  }, [size])

  const iconColor = useMemo(() => {
    if (disabled) return 'text-gray-40'
    return 'text-primary hover:text-primary-dark'
  }, [disabled])

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
    <a
      aria-hidden="true"
      onClick={e => onClick && onClick(e)}
      disabled={disabled}
      className={`
      flex justify-center items-center focus:outline-none rounded ${disabledStyle} ${colorStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {startIconComp}
      {children}
      {endIconComp}
    </a>
  )
}

CustomLink.propTypes = {
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

export default CustomLink
