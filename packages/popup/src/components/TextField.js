import PropTypes from 'prop-types'
import {forwardRef} from 'react'
import Input from '@fluent-wallet/component-input'
import {EditOutlined} from '@fluent-wallet/component-icons'
import {useState, useEffect} from 'react'
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
    controlInputStatus = '',
    inputClassName = '',
    maxLength = '20',
  },
  ref,
) {
  const [showInputStatus, setShowInputStatus] = useState(false)
  const [showEditIconStatus, setShowEditIconStatus] = useState(false)
  const {setLoading} = useLoading()

  useEffect(() => {
    if (controlInputStatus === 'show') {
      setShowInputStatus(true)
    }
    if (controlInputStatus === 'hidden') {
      setShowInputStatus(false)
    }
  }, [controlInputStatus])

  const onClickEditBtn = () => {
    setShowInputStatus(true)
    setTimeout(() => {
      ref?.current?.focus?.()
    })
  }

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

  const onMouseOver = bool => {
    if (!controlInputStatus) {
      setShowEditIconStatus(bool)
    }
  }

  return (
    <div
      className={`relative ${height} ${className}`}
      onMouseEnter={() => onMouseOver(true)}
      onMouseLeave={() => onMouseOver(false)}
    >
      {!showInputStatus && (
        <div className={`flex ${width} items-center`}>
          <div className={`${fontSize} text-ellipsis`}>{textValue}</div>
          {showEditIconStatus && !controlInputStatus ? (
            <EditOutlined
              className={
                'ml-2 w-4 h-4 cursor-pointer text-gray-60 hover:text-primary'
              }
              id="edit-text-value"
              onClick={onClickEditBtn}
            />
          ) : (
            <div className="ml-2 w-4 h-4" />
          )}
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
  // show,hidden or empty. not empty means to hide edit button and take over showInputStatus
  controlInputStatus: PropTypes.string,
}

export default TextField
