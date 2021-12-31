import React, {useMemo} from 'react'
import PropTypes from 'prop-types'
import {CloseOutlined} from '@fluent-wallet/component-icons'

const sizeStyleObj = {
  small: 'text-2xs h-4 px-1',
  medium: 'text-xs h-6 px-2',
}

const iconSizeObj = {
  small: 'w-2 h-2',
  medium: 'w-3 h-3',
}
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
      return 'text-primary bg-primary-10 hover:border-primary'
    } else if (color === 'error') {
      return 'text-error bg-error-10 hover:border-error'
    }
    return ''
  }, [disabled, color])

  const sizeStyle = sizeStyleObj[size] || ''
  const iconSize = iconSizeObj[size] || ''

  const iconColor = useMemo(() => {
    if (disabled) return 'text-gray-40'
    if (color === 'primary') return 'text-primary'
    if (color === 'error') return 'text-error'
  }, [disabled, color])

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
      flex justify-center items-center focus:outline-none rounded border border-solid border-transparent ${disabledStyle} ${colorStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {iconComp}
      {children}
      {closable && (
        <span
          data-testid="close-icon-wrapper"
          aria-hidden="true"
          onClick={e => onCloseClick(e)}
          className={`ml-1`}
        >
          {closeIcon ? (
            closeIconComp
          ) : (
            <CloseOutlined
              data-testid="close-icon"
              className={`${iconColor} ${iconSize}`}
            />
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
