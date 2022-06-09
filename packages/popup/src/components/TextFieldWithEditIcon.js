import PropTypes from 'prop-types'
import {useState, useRef} from 'react'

import {EditOutlined} from '@fluent-wallet/component-icons'
import {TextField} from './'
import useLoading from '../hooks/useLoading'

function TextFieldWithEditIcon({
  textValue,
  inputValue,
  onUpdateAccountGroupName,
  onInputChange,
  ...props
}) {
  const [showInputStatus, setShowInputStatus] = useState(false)
  const [showEditIconStatus, setShowEditIconStatus] = useState(false)

  const ref = useRef(null)
  const {setLoading} = useLoading()

  const onClickEditBtn = () => {
    setShowInputStatus?.(true)
    setTimeout(() => {
      ref?.current?.focus?.()
    })
  }

  const onSubmit = async () => {
    try {
      if (inputValue === textValue || !inputValue) {
        !inputValue && onInputChange?.(textValue)
        return setShowInputStatus?.(false)
      }
      setLoading(true)
      await onUpdateAccountGroupName?.()
      setLoading(false)
      setShowInputStatus?.(false)
    } catch (e) {
      setLoading(false)
      setShowInputStatus?.(false)
      onInputChange?.(textValue)
    }
  }

  return (
    <TextField
      ref={ref}
      showInputStatus={showInputStatus}
      setShowInputStatus={setShowInputStatus}
      onMouseEnter={() => setShowEditIconStatus(true)}
      onMouseLeave={() => setShowEditIconStatus(false)}
      textValue={textValue}
      inputValue={inputValue}
      onSubmit={onSubmit}
      onInputChange={onInputChange}
      {...props}
      rightComponent={
        <div className="ml-2 w-4 h-4">
          {showEditIconStatus && !showInputStatus && (
            <EditOutlined
              className={
                'w-4 h-4 cursor-pointer text-gray-60 hover:text-primary'
              }
              id="edit-text-value"
              onClick={onClickEditBtn}
            />
          )}
        </div>
      }
    />
  )
}

TextFieldWithEditIcon.propTypes = {
  textValue: PropTypes.string,
  inputValue: PropTypes.string,
  onUpdateAccountGroupName: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
}

export default TextFieldWithEditIcon
