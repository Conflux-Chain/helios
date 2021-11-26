import PropTypes from 'prop-types'
import Input from '@fluent-wallet/component-input'
import {Big} from '@fluent-wallet/data-format'

const formatInputValue = (targetValue, decimals, maxLength) => {
  if (targetValue === '' || isNaN(targetValue)) return ''
  let value = targetValue
  if (maxLength > 0 && targetValue.length > maxLength)
    value = targetValue.slice(0, maxLength)
  const ret = new Big(value).times(`1e${decimals}`)
  return ret.gte(0)
    ? ret.toString().indexOf('.') === -1
      ? value
      : ret.div(`1e${decimals}`).round(decimals).toString()
    : '0'
}

function NumberInput({
  onChange,
  value,
  decimals = 0,
  maxLength = '0',
  ...props
}) {
  const onInputChange = e => {
    const targetValue = e.target.value
    const formatValue = formatInputValue(targetValue, decimals, maxLength)
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
  maxLength: PropTypes.string,
}
export default NumberInput
