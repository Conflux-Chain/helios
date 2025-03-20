import {WarningFilled} from '@fluent-wallet/component-icons'
import PropTypes from 'prop-types'
import {useMemo} from 'react'

export const ConfirmInfo = ({
  label,
  error,
  ValueComponent,
  onClick,
  className,
  id,
  value,
  type = 'text',
}) => {
  // 使用 useMemo 缓存 Box 函数，避免每次渲染重新创建
  const Box = useMemo(() => {
    const BoxComponent = child =>
      error ? (
        <button
          type="button"
          className={`${className || ''} ${
            error ? 'text-warning cursor-pointer' : ''
          } text-left`}
          id={id}
          onClick={() => error && onClick && onClick(id)}
        >
          {child}
        </button>
      ) : (
        <span className={`${className || ''} text-left`} id={id}>
          {child}
        </span>
      )
    BoxComponent.displayName = 'Box'
    return BoxComponent
  }, [error, className, id, onClick])

  const DefaultValueComponent = useMemo(() => {
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

  return (
    <div className="flex">
      <span className="text-gray-40 mr-2 w-16">{label}</span>
      <div className="flex flex-1">
        {error && (
          <span className="text-red-60 mr-2">
            <WarningFilled />
          </span>
        )}
        {ValueComponent || DefaultValueComponent}
      </div>
    </div>
  )
}

ConfirmInfo.propTypes = {
  label: PropTypes.string,
  error: PropTypes.object,
  ValueComponent: PropTypes.element,
  onClick: PropTypes.func,
  className: PropTypes.string,
  id: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.oneOf([null, undefined]),
  ]),
  type: PropTypes.string,
}

export default ConfirmInfo
