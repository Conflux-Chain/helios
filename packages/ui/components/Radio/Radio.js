import {useContext, createRef} from 'react'
import {RadioGroupContext} from './context'
import PropTypes from 'prop-types'
import RcCheckbox from 'rc-checkbox'
import './radio.css'

const Radio = ({children, value, onChange, name, ...props}) => {
  const ref = createRef(null)
  const context = useContext(RadioGroupContext)
  const onRadioChange = e => {
    onChange?.(e)
    context?.onChange?.(e)
  }

  if (context) {
    props.checked = value === context.value
  }

  return (
    <label className={`flex cursor-pointer`}>
      <RcCheckbox
        type="radio"
        value={value}
        onChange={onRadioChange}
        name={context?.name || name}
        prefixCls={`radio-customize-prefix-cls`}
        {...props}
        ref={ref}
      />
      {children ? <span> children</span> : null}
    </label>
  )
}

Radio.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]),
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  name: PropTypes.string,
}
export default Radio
