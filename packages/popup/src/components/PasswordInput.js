import PropTypes from 'prop-types'
import {useState} from 'react'
import Input from '@fluent-wallet/component-input'
import {EyeInvisibleOutlined, EyeOutlined} from '@fluent-wallet/component-icons'

function PasswordInput({
  validateInputValue,
  setInputValue,
  errorMessage,
  value,
}) {
  const [eyeStatus, setEyeStatus] = useState('close')
  const onSuffixClick = () => {
    setEyeStatus(eyeStatus === 'close' ? 'open' : 'close')
  }

  const onInputChange = e => {
    validateInputValue && validateInputValue(e.target.value)
    setInputValue && setInputValue(e.target.value)
  }

  return (
    <Input
      onChange={onInputChange}
      type={eyeStatus === 'close' ? 'password' : 'text'}
      width="w-full box-border"
      errorMessage={errorMessage}
      value={value}
      suffix={
        eyeStatus === 'close' ? (
          <EyeInvisibleOutlined className="w-4 h-4 cursor-pointer" />
        ) : (
          <EyeOutlined className="w-4 h-4 cursor-pointer" />
        )
      }
      onSuffixClick={onSuffixClick}
      onCopy={e => e.preventDefault()}
      onCut={e => e.preventDefault()}
    />
  )
}
PasswordInput.propTypes = {
  validateInputValue: PropTypes.func,
  setInputValue: PropTypes.func,
  errorMessage: PropTypes.string,
  value: PropTypes.string.isRequired,
}
export default PasswordInput
