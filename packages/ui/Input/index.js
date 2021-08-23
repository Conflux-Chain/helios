import {useState, useMemo} from 'react'
import PropTypes from 'prop-types'

const sizeStyleObj = {
  small: 'h-8',
  medium: 'h-10',
  large: 'h-12',
}

const inputStyleObj = {
  small: 'text-xs',
  medium: 'text-sm',
  large: 'text-base',
}

const iconSizeObj = {
  small: 'w-3 h-3',
  medium: 'w-4 h-4',
  large: 'w-5 h-5',
}
const prefixStyleObj = {
  small: '-mr-2',
  medium: '-mr-1.5',
  large: '-mr-1',
}
const suffixStyleObj = {
  small: '-ml-2',
  medium: '-ml-1.5',
  large: '-ml-1',
}
function Input({
  prefix,
  suffix,
  value,
  disabled,
  className = '',
  containerClassName = '',
  onChange,
  bordered = true,
  size = 'medium',
  width = 'w-60',
  errorMessage = '',
  onBlur,
  ...props
}) {
  const [focused, setFocused] = useState(false)
  const disabledStyle = useMemo(() => {
    if (disabled) return 'bg-gray-10 cursor-not-allowed'
    return 'bg-gray-0'
  }, [disabled])

  const sizeStyle = sizeStyleObj[size] || ''
  const inputStyle = inputStyleObj[size] || ''
  const iconSize = iconSizeObj[size] || ''
  // eslint-disable-next-line no-unused-vars
  const prefixStyle = prefixStyleObj[size] || ''
  const suffixStyle = suffixStyleObj[size] || ''

  const borderStyle = useMemo(() => {
    if (!bordered) return 'border-0'
    if (errorMessage !== '') return 'border-error border'
    else return `border ${focused ? 'border-primary' : 'border-gray-20'}`
  }, [bordered, errorMessage, focused])

  return (
    <div className={`${width}`} data-testid="input-wrapper">
      <div
        data-testid="input-container"
        className={`flex justify-between items-center rounded ${width} ${disabledStyle} ${sizeStyle} ${borderStyle} ${containerClassName}`}
      >
        {prefix && (
          <div
            aria-hidden="true"
            onClick={() => setFocused(true)}
            className="pl-3 ${prefixStyle}"
          >
            <div className="text-gray-40 ${prefixStyle}">{prefix}</div>
          </div>
        )}
        <input
          data-testid="input-text"
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            onBlur && onBlur()
          }}
          onChange={e => onChange && onChange(e)}
          className={`w-full h-full px-3 text-gray-80 placeholder-gray-40 border-0 rounded p-0 outline-none ${inputStyle} ${className}`}
          {...props}
        />
        {suffix && (
          <div
            aria-hidden="true"
            onClick={() => setFocused(true)}
            className={`pr-3 ${suffixStyle}`}
          >
            <div className={`text-gray-40 ${iconSize}`}>{suffix}</div>
          </div>
        )}
      </div>
      {errorMessage && (
        <div className="text-xs text-error mt-2">{errorMessage}</div>
      )}
    </div>
  )
}

Input.propTypes = {
  value: PropTypes.string,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  onChange: PropTypes.func,
  width: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  errorMessage: PropTypes.string,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  disabled: PropTypes.bool,
  bordered: PropTypes.bool,
  onBlur: PropTypes.func,
}

export default Input
