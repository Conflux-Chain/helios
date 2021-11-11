import PropTypes from 'prop-types'
import Input from '@fluent-wallet/component-input'
import {Big} from '@fluent-wallet/data-format'

const formatInputValue = (targetValue, decimal) => {
  const ret = new Big(
    targetValue === '' || isNaN(targetValue) ? 0 : targetValue,
  ).round(decimal, 0)
  return ret.gte(0) ? ret.toString() : '0'
}

function NumberInput({onInputChange, value, decimal = 0, ...props}) {
  const onChange = e => {
    const targetValue = e.target.value
    onInputChange?.(formatInputValue(targetValue, decimal))
  }

  return <Input {...props} onChange={onChange} value={value} type="number" />
}

NumberInput.propTypes = {
  value: PropTypes.string.isRequired,
  onInputChange: PropTypes.func,
  decimal: PropTypes.number,
}
export default NumberInput
