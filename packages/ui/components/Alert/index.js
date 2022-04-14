import React, {useMemo} from 'react'
import PropTypes from 'prop-types'
import {
  CloseOutlined,
  CloseCircleFilled,
  InfoCircleFilled,
  CheckCircleFilled,
  ExclamationCircleFilled,
} from '@fluent-wallet/component-icons'

const typeToIcon = {
  success: <CheckCircleFilled className="w-4 h-4 mr-2 text-success" />,
  info: <InfoCircleFilled className="w-4 h-4 mr-2 text-info" />,
  error: <CloseCircleFilled className="w-4 h-4 mr-2 text-error" />,
  warning: <ExclamationCircleFilled className="w-4 h-4 mr-2 text-warning" />,
}

const contentStyleObj = {
  info: 'text-info-dark',
  warning: 'text-warning-dark',
  error: 'text-error-dark',
  success: 'text-success-dark',
}
function Alert({
  type = 'success',
  icon,
  className = '',
  width = 'w-100',
  open = false,
  closable = true,
  closeIcon,
  onClose,
  content,
  bordered = false,
}) {
  const IconComponent = typeToIcon[type]

  const style = useMemo(() => {
    if (type === 'info')
      return `bg-info-10 ${bordered ? 'border-info' : 'border-info-10'}`
    if (type === 'warning')
      return `bg-warning-10 ${
        bordered ? 'border-warning' : 'border-warning-10'
      }`
    if (type === 'error')
      return `bg-error-10 ${bordered ? 'border-error' : 'border-error-10'}`
    if (type === 'success')
      return `bg-success-10 ${
        bordered ? 'border-success' : 'border-success-10'
      }`
  }, [bordered, type])

  const contentStyle = contentStyleObj[type] || ''

  const onCloseClick = e => {
    e.stopPropagation()
    if (closable) {
      onClose && onClose(e)
    }
  }

  const closeIconComp = closeIcon
    ? React.cloneElement(closeIcon, {
        className: `w-4 h-4 text-gray-40 ${closeIcon.props.className || ''}`,
      })
    : null

  if (!open) return null

  return (
    <div
      data-testid="alert-wrapper"
      className={`flex items-center justify-between px-4 py-3 border border-solid ${style} ${width} ${className}`}
    >
      <div className="flex items-start">
        <span className="shrink-0">{icon || IconComponent || null}</span>
        <span className={`${contentStyle}`}>{content}</span>
      </div>
      {closable && (
        <span
          aria-hidden="true"
          data-testid="alert-close"
          onClick={e => onCloseClick(e)}
        >
          {closeIcon ? (
            closeIconComp
          ) : (
            <CloseOutlined
              className="w-4 h-4 text-gray-40"
              onClick={e => onCloseClick(e)}
            />
          )}
        </span>
      )}
    </div>
  )
}

export default Alert

Alert.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
  className: PropTypes.string,
  width: PropTypes.string,
  open: PropTypes.bool,
  closable: PropTypes.bool,
  bordered: PropTypes.bool,
  onClose: PropTypes.func,
  closeIcon: PropTypes.node,
  icon: PropTypes.node,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
}
