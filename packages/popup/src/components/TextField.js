import PropTypes from 'prop-types'
import {forwardRef} from 'react'
import Input from '@fluent-wallet/component-input'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import useLoading from '../hooks/useLoading'
import {isKeyOf} from '../utils'

const TextField = forwardRef(function TextField(
  {
    onSubmit,
    inputValue,
    textValue,
    onInputChange,
    width = 'w-[188px]',
    height = 'h-[18px]',
    fontSize = 'text-sm',
    className = '',
    inputClassName = '',
    maxLength = '20',
    isAddress = false,
    showInputStatus = false,
    setShowInputStatus,
    rightComponent,
    ...props
  },
  ref,
) {
  const {setLoading} = useLoading()

  const onSubmitInputValue = () => {
    if (!onSubmit) {
      return
    }

    if (inputValue === textValue || !inputValue) {
      !inputValue && onInputChange(textValue)
      return setShowInputStatus(false)
    }
    setLoading(true)
    onSubmit()
      .then(() => {
        setLoading(false)
        setShowInputStatus(false)
      })
      .catch(() => {
        setLoading(false)
        setShowInputStatus(false)
        onInputChange(textValue)
      })
  }

  const onKeyDown = e => {
    if (isKeyOf(e, 'enter')) {
      onSubmitInputValue()
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
          className={`!p-0 text-gray-60 ${height} ${fontSize}`}
          ref={ref}
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onBlur={onSubmitInputValue}
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
  maxLength: PropTypes.string,
  // show or hidden  input
  showInputStatus: PropTypes.bool,
  setShowInputStatus: PropTypes.func,
  // display address must be shorten
  isAddress: PropTypes.bool,
  rightComponent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]),
}

export default TextField
