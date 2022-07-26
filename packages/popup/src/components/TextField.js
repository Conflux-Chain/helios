import PropTypes from 'prop-types'
import {forwardRef} from 'react'
import Input from '@fluent-wallet/component-input'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {isKeyOf} from '../utils'

const TextField = forwardRef(function TextField(
  {
    onSubmit,
    inputValue,
    textValue,
    onInputChange,
    width = 'w-[188px]',
    height = '!h-[18px]',
    fontSize = 'text-sm',
    placeholder = '',
    className = '',
    inputClassName = '',
    inputInnerClassName = '',
    maxLength = '20',
    isAddress = false,
    showInputStatus = false,
    triggerEnter = true,
    triggerBlur = true,
    rightComponent,
    ...props
  },
  ref,
) {
  const onKeyDown = e => {
    if (isKeyOf(e, 'enter')) {
      triggerEnter && onSubmit()
    }
  }

  return (
    <div className={`relative ${height} ${className}`} {...props}>
      {!showInputStatus && (
        <div className={`flex ${width} items-center`}>
          <div className={`${fontSize} text-ellipsis`}>
            {isAddress && textValue ? shortenAddress(textValue) : textValue}
          </div>

          <div>{rightComponent || <div className="ml-2 w-4 h-4" />}</div>
        </div>
      )}
      {
        <Input
          width={width}
          maxLength={maxLength}
          containerClassName={`absolute align-top top-0 left-0 bg-transparent ${height} ${inputClassName} ${
            showInputStatus ? 'visible' : 'invisible'
          }`}
          className={`!p-0 text-gray-60 ${height} ${fontSize} ${inputInnerClassName}`}
          placeholder={placeholder}
          ref={ref}
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onBlur={() => triggerBlur && onSubmit()}
          onKeyDown={onKeyDown}
        />
      }
    </div>
  )
})

TextField.propTypes = {
  textValue: PropTypes.string.isRequired,
  inputValue: PropTypes.string.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  width: PropTypes.string,
  height: PropTypes.string,
  fontSize: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  inputInnerClassName: PropTypes.string,
  maxLength: PropTypes.string,
  placeholder: PropTypes.string,
  // show or hidden  input
  showInputStatus: PropTypes.bool,
  // display address must be shorten
  isAddress: PropTypes.bool,
  // submit when press enter
  triggerEnter: PropTypes.bool,
  // submit when blur
  triggerBlur: PropTypes.bool,
  rightComponent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]),
}

export default TextField
