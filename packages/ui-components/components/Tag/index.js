import React, {useMemo} from 'react'
import PropTypes from 'prop-types'
import {Close} from '../../assets/svg'

function Tag({
  onClose,
  onClick,
  className = '',
  children,
  size = 'medium',
  color = 'primary',
  icon,
  closeIcon,
  disabled = false,
  closable = false,
  ...props
}) {
  const disabledStyle = useMemo(() => {
    if (disabled) {
      return 'bg-gray-20 text-gray-40 cursor-not-allowed'
    }
    return ''
  }, [disabled])

  const colorStyle = useMemo(() => {
    if (disabled) return ''
    if (color === 'primary') {
      return 'text-primary bg-primary-10 border border-transparent hover:border-primary'
    } else if (color === 'error') {
      return 'text-error bg-error-10 border border-transparent hover:border-error'
    }
    return ''
  }, [disabled, color])

  const sizeStyle = useMemo(() => {
    if (size === 'medium') return 'text-xs h-6 px-2'
    if (size === 'small') return 'text-2xs h-4 px-1'
    return ''
  }, [size])

  const iconColor = useMemo(() => {
    if (disabled) return 'text-gray-40'
    if (color === 'primary') return 'text-primary'
    if (color === 'error') return 'text-error'
  }, [disabled, color])

  const iconSize = useMemo(() => {
    if (size === 'medium') return 'w-3 h-3'
    if (size === 'small') return 'w-2 h-2'
  }, [size])

  const onCloseClick = e => {
    e.stopPropagation()
    !disabled && onClose && onClose(e)
  }

  const iconComp = icon
    ? React.cloneElement(icon, {
        className: `mr-1 ${iconColor} ${iconSize} ${
          icon.props.className || ''
        }`,
      })
    : null

  const closeIconComp = closeIcon
    ? React.cloneElement(closeIcon, {
        className: `${iconColor} ${iconSize} ${
          closeIcon.props.className || ''
        }`,
      })
    : null

  return (
    <button
      onClick={e => onClick && onClick(e)}
      disabled={disabled}
      className={`
      flex justify-center items-center focus:outline-none rounded ${disabledStyle} ${colorStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {iconComp}
      {children}
      {closable && (
        <span
          aria-hidden="true"
          onClick={e => onCloseClick(e)}
          className={`ml-1`}
        >
          {closeIcon ? (
            closeIconComp
          ) : (
            <Close className={`${iconColor} ${iconSize}`} />
          )}
        </span>
      )}
    </button>
  )
}

Tag.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium']),
  color: PropTypes.string,
  disabled: PropTypes.bool,
  closable: PropTypes.bool,
  onClose: PropTypes.func,
  onClick: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  icon: PropTypes.node,
  closeIcon: PropTypes.node,
}

export default Tag
