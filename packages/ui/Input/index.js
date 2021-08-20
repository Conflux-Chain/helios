import {useState, useMemo} from 'react'
import PropTypes from 'prop-types'

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

  const sizeStyle = useMemo(() => {
    if (size === 'small') return 'h-8'
    if (size === 'medium') return 'h-10'
    if (size === 'large') return 'h-12'
  }, [size])

  const inputStyle = useMemo(() => {
    if (size === 'small') return 'text-xs'
    if (size === 'medium') return 'text-sm'
    if (size === 'large') return 'text-base'
  }, [size])

  const iconSize = useMemo(() => {
    if (size === 'small') return 'w-3 h-3'
    if (size === 'medium') return 'w-4 h-4'
    if (size === 'large') return 'w-5 h-5'
  }, [size])

  // eslint-disable-next-line no-unused-vars
  const prefixStyle = useMemo(() => {
    if (size === 'small') return '-mr-2'
    if (size === 'medium') return '-mr-1.5'
    if (size === 'large') return '-mr-1'
  }, [size])

  const suffixStyle = useMemo(() => {
    if (size === 'small') return '-ml-2'
    if (size === 'medium') return '-ml-1.5'
    if (size === 'large') return '-ml-1'
  }, [size])

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
