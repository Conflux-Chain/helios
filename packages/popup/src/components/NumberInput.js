import PropTypes from 'prop-types'
import Input from '@fluent-wallet/component-input'
import {Big} from '@fluent-wallet/data-format'
import {useDebouncedCallback} from 'use-debounce'

const formatInputValue = (targetValue, decimals) => {
  const reCenter = /^(0|[1-9]\d*)(\.){1}$/
  const re = /^(0|[1-9]\d*)(\.\d+)?$/
  const exponentialCenter = /^\d+(\.\d+)?([Ee]{1})$/
  const exponential = /^\d+(\.\d+)?([Ee][+-]?[\d]+)?$/
  if (!targetValue) return ''
  if (isNaN(targetValue)) {
    if (exponentialCenter.test(targetValue)) return targetValue
    else return ''
  }
  if (reCenter.test(targetValue)) return targetValue
  if (re.test(targetValue) || exponential.test(targetValue)) {
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
  return ''
}

function NumberInput({onChange, value, decimals = 0, ...props}) {
  const onInputChange = useDebouncedCallback(value => {
    const formatValue = formatInputValue(value, decimals)
    onChange?.(formatValue)
  }, 100)

  return (
    <Input
      {...props}
      onChange={e => onInputChange(e.target.value)}
      value={value}
      type="text"
    />
  )
}

NumberInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  decimals: PropTypes.number,
}
export default NumberInput
