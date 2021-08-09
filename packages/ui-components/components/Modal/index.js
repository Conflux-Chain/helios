import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {useClickAway} from 'react-use'
import {Close} from '../../assets/svg'

function Modal({
  className = '',
  width,
  open = false,
  closable = true,
  closeIcon,
  icon,
  onClose,
  title,
  content,
  actions,
  size = 'small',
  ...props
}) {
  const ref = useRef(null)

  const onCloseClick = e => {
    e.stopPropagation()
    if (closable) {
      onClose && onClose(e)
    }
  }

  useClickAway(ref, e => {
    onClose && onClose(e)
  })

  const iconComp = icon
    ? React.cloneElement(icon, {
        className: `w-12 h-12 mb-3 ${icon.props.className || ''}`,
      })
    : null

  const closeIconComp = closeIcon
    ? React.cloneElement(closeIcon, {
        className: `${size === 'medium' ? 'w-6 h-6' : 'w-4 h-4'} text-gray-40 ${
          closeIcon.props.className || ''
        }`,
      })
    : null

  if (!open) return null
  return (
    <div
      ref={ref}
      className="fixed w-full h-full top-0 left-0 px-3 md:px-0 bg-black bg-opacity-60 transation flex justify-center items-center z-10"
    >
      <div
        className={`relative overflow-auto flex flex-col items-center z-20 ${
          width
            ? width
            : size === 'medium'
            ? 'w-full md:w-110'
            : 'w-full md:w-70'
        } rounded bg-gray-0 shadow-3 p-6 ${className}`}
        {...props}
      >
        {closable && (
          <span
            aria-hidden="true"
            onClick={e => onCloseClick(e)}
            className="absolute top-3 right-3"
          >
            {closeIcon ? (
              closeIconComp
            ) : (
              <Close
                className={`${
                  size === 'medium' ? 'w-6 h-6' : 'w-4 h-4'
                } text-gray-40`}
              />
            )}
          </span>
        )}
        {iconComp}
        {title && (
          <div className="text-base text-gray-100 mb-2 font-medium">
            {title}
          </div>
        )}
        <div className="text-gray-60 w-full">{content}</div>
        {actions && (
          <div className="flex items-center w-full mt-4">{actions}</div>
        )}
      </div>
    </div>
  )
}

export default Modal

Modal.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium']),
  width: PropTypes.string,
  title: PropTypes.string,
  open: PropTypes.bool,
  closable: PropTypes.bool,
  onClose: PropTypes.func,
  actions: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  content: PropTypes.node.isRequired,
  icon: PropTypes.node,
  closeIcon: PropTypes.node,
}
