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
  const clearInput = e => {
    e.target.value = ''
    onInputChange(e)
  }

  const onKeyDown = e => {
    if (e.key === '-' || e.key === 'e') {
      clearInput(e)
      e.preventDefault()
    }
  }

  const onCompositionEnd = e => {
    if (e?.data === 'e') {
      clearInput(e)
    }
  }

  return (
    <Input
      {...props}
      onChange={onInputChange}
      onKeyDown={onKeyDown}
      onCompositionEnd={onCompositionEnd}
      value={value}
      type="number"
      onPaste={e => e.preventDefault()}
    />
  )
}

NumberInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  decimals: PropTypes.number,
  maxLength: PropTypes.string,
}
export default NumberInput
