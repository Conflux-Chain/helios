import PropTypes from 'prop-types'
import Input from '@fluent-wallet/component-input'
import {EditOutlined} from '@fluent-wallet/component-icons'
import {useState, useRef} from 'react'
import useLoading from '../hooks/useLoading'
import {isKeyOf} from '../utils'

function TextField({
  onInputBlur,
  inputValue,
  textValue,
  onInputChange,
  width = 'w-[188px]',
  height = 'h-[18px]',
  fontSize = 'text-sm',
  className = '',
}) {
  const [showInputStatus, setShowInputStatus] = useState(false)
  const [showEditIconStatus, setShowEditIconStatus] = useState(false)
  const {setLoading} = useLoading()

  const inputRef = useRef(null)

  const onClickEditBtn = () => {
    setShowInputStatus(true)
    setTimeout(() => {
      inputRef.current.focus()
    })
  }

  const onBlur = () => {
    if (inputValue === textValue || !inputValue) {
      !inputValue && onInputChange(textValue)
      return setShowInputStatus(false)
    }
    setLoading(true)
    onInputBlur()
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
      onBlur()
    }
  }

  return (
    <div
      className={`relative ${height} ${className}`}
      onMouseEnter={() => setShowEditIconStatus(true)}
      onMouseLeave={() => setShowEditIconStatus(false)}
    >
      {!showInputStatus && (
        <div className={`flex ${width} items-center`}>
          <div className={`${fontSize} text-ellipsis`}>{textValue}</div>
          {showEditIconStatus ? (
            <EditOutlined
              className={
                'ml-2 w-4 h-4 cursor-pointer text-gray-60 hover:text-primary'
              }
              id="edit-textValue"
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
          maxLength="20"
          containerClassName={`border-none absolute align-top top-0 left-0 bg-transparent ${height} ${
            showInputStatus ? 'visible' : 'invisible'
          }`}
          className={`!p-0 text-gray-60 ${height} ${fontSize}`}
          ref={inputRef}
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        />
      }
    </div>
  )
}

TextField.propTypes = {
  textValue: PropTypes.string.isRequired,
  inputValue: PropTypes.string.isRequired,
  onInputBlur: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
  fontSize: PropTypes.string,
  className: PropTypes.string,
}

export default TextField
