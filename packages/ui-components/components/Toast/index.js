import PropTypes from 'prop-types'
import React, {useEffect} from 'react'

function Toast({
  className = '',
  open,
  icon,
  title,
  content,
  autoHideDuration = 2000,
  type = 'block',
  onClose,
  ...props
}) {
  useEffect(() => {
    if (open) setTimeout(() => onClose && onClose(), autoHideDuration)
  }, [open, autoHideDuration, onClose])
  if (!open) return null
  const iconComp = icon
    ? React.cloneElement(icon, {
        className: `w-13 h-13 mb-2 ${icon.props.className || ''}`,
      })
    : null

  if (type === 'block') {
    return (
      <div
        className={`absolute flex flex-col items-center justify-center rounded-sm bg-black bg-opacity-60 p-3 w-35 max-h-52 shadow-1 z-20 ${className}`}
        {...props}
      >
        {iconComp}
        {title && (
          <div className="text-base text-white font-medium mb-0.5">{title}</div>
        )}
        <div className="text-xs text-gray-20">{content}</div>
      </div>
    )
  } else if (type === 'line' || !title) {
    return (
      <div
        className={`absolute flex items-center justify-center h-10 px-4 max-w-sm rounded-sm bg-black bg-opacity-60 shadow-1 z-20 ${className}`}
        {...props}
      >
        {icon && <img src={icon} alt="status" className="mr-2 w-6 h-6" />}
        <div className="text-xs text-white">{content}</div>
      </div>
    )
  }
  return null
}

Toast.propTypes = {
  className: PropTypes.string,
  open: PropTypes.bool,
  icon: PropTypes.node,
  title: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  autoHideDuration: PropTypes.number,
  type: PropTypes.oneOf(['block', 'line']),
  onClose: PropTypes.func,
  top: PropTypes.string,
}

export default Toast
