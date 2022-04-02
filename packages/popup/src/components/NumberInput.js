import PropTypes from 'prop-types'
import Input from '@fluent-wallet/component-input'
import {Big} from '@fluent-wallet/data-format'

const formatInputValue = (targetValue, decimals) => {
  if (targetValue === '' || isNaN(targetValue)) return ''
  let value = targetValue
  if (decimals > 0 && targetValue.indexOf('.') > -1) {
    const splitValue = targetValue.split('.')
    value = splitValue?.[0] + '.' + splitValue?.[1]?.slice(0, decimals)
  }
  const ret = new Big(value).times(`1e${decimals}`)
  return ret.gte(0)
    ? ret.toString().indexOf('.') === -1
      ? value
      : ret.div(`1e${decimals}`).round(decimals).toString()
    : '0'
}

function NumberInput({onChange, value, decimals = 0, ...props}) {
  const onInputChange = e => {
    const targetValue = e.target.value
    const formatValue = formatInputValue(targetValue, decimals)
    e.target.value = formatValue
    onChange?.(e)
  }
  const clearInput = e => {
    e.target.value = ''
    onInputChange(e)
  }

  const onKeyDown = e => {
    if (e?.key === '-' || e?.key === '+' || e?.key?.toLowerCase?.() === 'e') {
      e.preventDefault()
    }
  }

  const onCompositionEnd = e => {
    clearInput(e)
    e.preventDefault()
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
}
export default NumberInput
