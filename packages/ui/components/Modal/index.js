import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {useClickAway} from 'react-use'
import {CloseOutlined} from '@fluent-wallet/component-icons'

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
  size = 'medium',
  contentClassName = '',
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
        className: `${size === 'large' ? 'w-6 h-6' : 'w-4 h-4'} text-gray-40 ${
          closeIcon.props.className || ''
        }`,
      })
    : null

  if (!open) return null
  return (
    <div
      data-testid="modal-wrapper"
      ref={ref}
      className="fixed w-full h-full top-0 left-0 px-3 md:px-0 bg-[#000] bg-opacity-60 transition flex justify-center items-center z-50"
    >
      <div
        data-testid="modal-content"
        className={`relative overflow-auto flex flex-col items-center z-20 ${
          width
            ? width
            : size === 'large'
            ? 'w-full md:w-110'
            : size === 'medium'
            ? 'w-full md:w-80'
            : 'w-full md:w-70'
        } rounded bg-gray-0 shadow-3 p-6 ${className}`}
        {...props}
      >
        {closable && (
          <span
            aria-hidden="true"
            onClick={e => onCloseClick(e)}
            className="absolute top-3 right-3"
            data-testid="modal-close-wrapper"
          >
            {closeIcon ? (
              closeIconComp
            ) : (
              <CloseOutlined
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
        <div className={`text-gray-60 w-full ${contentClassName}`}>
          {content}
        </div>
        {actions && (
          <div className="flex items-center w-full mt-6">{actions}</div>
        )}
      </div>
    </div>
  )
}

export default Modal

Modal.propTypes = {
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
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
