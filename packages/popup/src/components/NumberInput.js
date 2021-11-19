import PropTypes from 'prop-types'
import Input from '@fluent-wallet/component-input'
import {Big} from '@fluent-wallet/data-format'

const formatInputValue = (targetValue, decimals) => {
  if (targetValue === '' || isNaN(targetValue)) return ''
  const ret = new Big(targetValue).round(decimals, 0)
  return ret.gte(0) ? ret.toString() : '0'
}

function NumberInput({onChange, value, decimals = 0, ...props}) {
  const onInputChange = e => {
    const targetValue = e.target.value
    const formatValue = formatInputValue(targetValue, decimals)
    e.target.value = formatValue
    onChange?.(e)
  }

  return (
    <Input {...props} onChange={onInputChange} value={value} type="number" />
  )
}

NumberInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  decimals: PropTypes.number,
}
export default NumberInput
