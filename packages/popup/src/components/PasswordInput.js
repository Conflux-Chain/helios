import PropTypes from 'prop-types'
import {useState} from 'react'
import Input from '@cfxjs/component-input'
import {EyeClose, EyeOpen} from '@cfxjs/component-icons'

const PasswordInput = ({setInputErrorMessage, setInputValue, errorMessage}) => {
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
      width="w-full"
      bordered={true}
      errorMessage={errorMessage}
      suffix={eyeStatus === 'close' ? <EyeClose /> : <EyeOpen />}
      onSuffixClick={onSuffixClick}
    ></Input>
  )
}
PasswordInput.propTypes = {
  setInputErrorMessage: PropTypes.func,
  setInputValue: PropTypes.func,
  errorMessage: PropTypes.string,
}
export default PasswordInput
