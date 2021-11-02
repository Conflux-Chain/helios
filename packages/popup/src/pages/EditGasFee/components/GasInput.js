import PropTypes from 'prop-types'
import Input from '@fluent-wallet/component-input'
function GasInput({onGasInputChange, value, ...props}) {
  const onChange = e => {
    const value = parseInt(e.target.value, 10) || 0
    onGasInputChange?.(`${value >= 0 ? value : 0}`)
  }
  return <Input {...props} onChange={onChange} value={value} />
}

GasInput.propTypes = {
  value: PropTypes.string.isRequired,
  onGasInputChange: PropTypes.func,
}
export default GasInput
