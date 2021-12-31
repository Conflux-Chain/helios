import PropTypes from 'prop-types'
import {RadioGroupContextProvider} from './context'

function RadioGroup({onChange, value, name, children}) {
  return (
    <RadioGroupContextProvider
      value={{
        onChange,
        value,
        name,
      }}
    >
      {children}
    </RadioGroupContextProvider>
  )
}

RadioGroup.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
}

export default RadioGroup
