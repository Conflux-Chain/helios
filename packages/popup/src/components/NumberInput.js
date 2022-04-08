import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import Input from '@fluent-wallet/component-input'
import {Big} from '@fluent-wallet/data-format'

const reCenter = /^(0|[1-9]\d*)(\.){1}$/
const re = /^(0|[1-9]\d*)(\.\d+)?$/
const exponentialCenter = /^\d+(\.\d+)?([Ee]{1})$/
const exponential = /^\d+(\.\d+)?([Ee][+-]?[\d]+)?$/

const formatInputValue = (targetValue, decimals) => {
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
      ? ret.toString(10).indexOf('.') === -1
        ? value
        : ret.div(`1e${decimals}`).round(decimals).toString()
      : '0'
  }
  return ''
}

function NumberInput({onChange, value, decimals = 0, ...props}) {
  const [inputValue, setInputValue] = useState('')
  const onInputChange = targetValue => {
    const formatValue = formatInputValue(targetValue, decimals)
    if (!exponentialCenter.test(formatValue)) onChange?.(formatValue)
    setInputValue(formatValue)
  }

  useEffect(() => {
    setInputValue(value)
  }, [value])

  return (
    <Input
      {...props}
      onChange={e => onInputChange(e.target.value)}
      value={inputValue}
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
