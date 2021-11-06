import {useContext, createRef} from 'react'
import {RadioGroupContext} from './context'
import PropTypes from 'prop-types'
import RcCheckbox from 'rc-checkbox'
import './radio.css'

const Radio = ({
  children,
  value,
  onChange,
  name,
  wrapperClassName = '',
  radioClassName = '',
  ...props
}) => {
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
    <label className={`flex cursor-pointer ${wrapperClassName}`}>
      <RcCheckbox
        type="radio"
        value={value}
        onChange={onRadioChange}
        name={context?.name || name}
        prefixCls={`radio-customize-prefix-cls`}
        className={radioClassName}
        {...props}
        ref={ref}
      />
      {children ? <div className="flex-1"> {children}</div> : null}
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
  wrapperClassName: PropTypes.string,
  radioClassName: PropTypes.string,
}
export default Radio
