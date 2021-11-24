import PropTypes from 'prop-types'
import Input from '@fluent-wallet/component-input'
import {Big} from '@fluent-wallet/data-format'

const formatInputValue = (targetValue, decimals) => {
  if (targetValue === '' || isNaN(targetValue)) return ''
  const ret = new Big(targetValue).times(`1e${decimals}`)
  return ret.eq(0)
    ? targetValue
    : ret.gte(1)
    ? ret.div(`1e${decimals}`).round(decimals, 0).toString()
    : '0'
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
