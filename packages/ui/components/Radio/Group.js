import PropTypes from 'prop-types'
import {RadioGroupContextProvider} from './context'

function RadioGroup({ onRadioChange, value, name, children }) {
  
  const renderGroup = children => {
    return <div>{children}</div>
  }

  return (
    <RadioGroupContextProvider
      value={{
        onChange: onRadioChange,
        value,
        name,
      }}
      {...renderGroup(children)}
    ></RadioGroupContextProvider>
  )
}

RadioGroup.propTypes = {
  value: PropTypes.string.isRequired,
  onRadioChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
}

export default RadioGroup
