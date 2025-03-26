import {WarningFilled} from '@fluent-wallet/component-icons'
import PropTypes from 'prop-types'
import {useMemo} from 'react'

export const ConfirmInfo = ({
  label,
  error,
  customValueComponent: CustomValueComponent,
  onClick,
  className,
  id,
  value,
  type = 'text',
}) => {
  const Box = useMemo(() => {
    const BoxComponent = child => {
      const baseClassName = `${className || ''} text-left`

      return error ? (
        <button
          type="button"
          className={`${baseClassName} ${
            error ? 'text-warning cursor-pointer' : ''
          }`}
          id={id}
          onClick={() => error && onClick && onClick(id)}
        >
          {child}
        </button>
      ) : (
        <span className={baseClassName} id={id}>
          {child}
        </span>
      )
    }

    BoxComponent.displayName = 'Box'
    return BoxComponent
  }, [error, className, id, onClick])

  const DefaultValueComponent = useMemo(() => {
    if (!value) return null

    if (type === 'text') {
      return Box(value)
    }

    if (type === 'array' && Array.isArray(value)) {
      return (
        <div>
          {value.map((v, i) => (
            <div className="flex flex-1 mb-1" key={i}>
              {Box(v)}
            </div>
          ))}
        </div>
      )
    }

    return null
  }, [Box, type, value])

  if (!value && !CustomValueComponent) return null

  return (
    <div className="flex">
      <span className="text-gray-40 w-[70px]">{label}</span>
      <div className="flex flex-1">
        {error && (
          <span className="text-red-60 mr-2">
            <WarningFilled />
          </span>
        )}
        {CustomValueComponent || DefaultValueComponent}
      </div>
    </div>
  )
}

ConfirmInfo.propTypes = {
  label: PropTypes.string,
  error: PropTypes.object,
  customValueComponent: PropTypes.element,
  onClick: PropTypes.func,
  className: PropTypes.string,
  id: PropTypes.string,
  value: PropTypes.any,
  type: PropTypes.oneOf(['text', 'array']),
}

export default ConfirmInfo
