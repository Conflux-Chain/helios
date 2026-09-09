import {WarningFilled} from '@fluent-wallet/component-icons'
import PropTypes from 'prop-types'

export const ConfirmInfo = ({
  label,
  error,
  customValueComponent,
  onClick,
  className,
  labelClassName = 'w-[70px]',
  id,
  value,
  type = 'text',
}) => {
  const hasValue = Boolean(value)

  const renderValue = child => {
    const valueClassName = `${className ?? ''} text-left`

    if (!error) {
      return (
        <span className={valueClassName} id={id}>
          {child}
        </span>
      )
    }

    return (
      <button
        type="button"
        className={`${valueClassName} cursor-pointer text-warning`}
        id={id}
        onClick={() => onClick?.(id)}
      >
        {child}
      </button>
    )
  }

  let defaultValueComponent = null
  if (hasValue && type === 'text') {
    defaultValueComponent = renderValue(value)
  } else if (type === 'array' && Array.isArray(value)) {
    defaultValueComponent = (
      <div>
        {value.map((item, index) => (
          <div className="mb-1 flex flex-1" key={index}>
            {renderValue(item)}
          </div>
        ))}
      </div>
    )
  }

  if (!hasValue && !customValueComponent) return null

  return (
    <div className="flex">
      <span className={`text-gray-40 ${labelClassName}`}>{label}</span>
      <div className="flex min-w-0 flex-1">
        {error && (
          <span className="text-red-60 mr-2">
            <WarningFilled />
          </span>
        )}
        {customValueComponent ?? defaultValueComponent}
      </div>
    </div>
  )
}

ConfirmInfo.propTypes = {
  label: PropTypes.node.isRequired,
  error: PropTypes.object,
  customValueComponent: PropTypes.element,
  onClick: PropTypes.func,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  id: PropTypes.string.isRequired,
  value: PropTypes.any,
  type: PropTypes.oneOf(['text', 'array']),
}

export default ConfirmInfo
