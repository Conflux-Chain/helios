import PropTypes from 'prop-types'
import {useState} from 'react'
import Input from '@cfxjs/component-input'
import {EyeClose, EyeOpen} from '@cfxjs/component-icons'

const PasswordInput = ({
  setInputErrorMessage,
  setInputValue,
  errorMessage,
  value,
}) => {
  const [eyeStatus, setEyeStatus] = useState('close')
  const onSuffixClick = () => {
    setEyeStatus(eyeStatus === 'close' ? 'open' : 'close')
  }

  const onInputChange = e => {
    setInputErrorMessage && setInputErrorMessage(e.target.value)
    setInputValue && setInputValue(e.target.value)
  }

  return (
    <Input
      onChange={onInputChange}
      onFocus={onInputChange}
      type={eyeStatus === 'close' ? 'password' : 'text'}
      width="w-full box-border"
      bordered={true}
      errorMessage={errorMessage}
      value={value}
      suffix={
        eyeStatus === 'close' ? (
          <EyeClose className="w-4 h-4" />
        ) : (
          <EyeOpen className="w-4 h-4" />
        )
      }
      onSuffixClick={onSuffixClick}
      onCopy={e => e.preventDefault()}
      onCut={e => e.preventDefault()}
    />
  )
}
PasswordInput.propTypes = {
  setInputErrorMessage: PropTypes.func,
  setInputValue: PropTypes.func,
  errorMessage: PropTypes.string,
  value: PropTypes.string.isRequired,
}
export default PasswordInput
