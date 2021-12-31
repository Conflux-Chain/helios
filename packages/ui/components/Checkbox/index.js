import React from 'react'
import PropTypes from 'prop-types'
import {CheckSquareFilled, SquareOutlined} from '@fluent-wallet/component-icons'

function Checkbox({
  checked,
  onChange,
  children,
  className = '',
  iconClassName = '',
  disabled = false,
}) {
  return (
    <div
      data-testid="checkbox-wrapper"
      onClick={() => !disabled && onChange && onChange()}
      aria-hidden="true"
      className={`flex items-center cursor-pointer ${className}`}
    >
      {checked && (
        <CheckSquareFilled
          className={`w-4 h-4 mr-2 ${
            disabled ? 'text-gray-40' : 'text-primary'
          } ${iconClassName}`}
          data-testid="checked-svg"
        />
      )}
      {!checked && (
        <SquareOutlined
          data-testid="non-checked-svg"
          className={`w-4 h-4 mr-2 text-gray-40 ${iconClassName}`}
        />
      )}
      {children}
    </div>
  )
}

export default Checkbox

Checkbox.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
  iconClassName: PropTypes.string,
  onChange: PropTypes.func,
}
