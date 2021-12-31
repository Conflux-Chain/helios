import React from 'react'
import PropTypes from 'prop-types'
import {CheckSquareFilled, SquareOutlined} from '@fluent-wallet/component-icons'

function Checkbox({checked, onChange, children, className}) {
  return (
    <div
      data-testid="checkbox-wrapper"
      onClick={() => onChange && onChange()}
      aria-hidden="true"
      className={`flex items-center cursor-pointer ${className}`}
    >
      {checked && (
        <CheckSquareFilled
          className="w-4 h-4 mr-2 text-primary"
          data-testid="checked-svg"
        />
      )}
      {!checked && (
        <SquareOutlined
          data-testid="non-checked-svg"
          className="w-4 h-4 mr-2 text-gray-40"
        />
      )}
      {children}
    </div>
  )
}

export default Checkbox

Checkbox.propTypes = {
  checked: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
  onChange: PropTypes.func,
}
