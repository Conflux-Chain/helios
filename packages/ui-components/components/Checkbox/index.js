import React from 'react'
import PropTypes from 'prop-types'
import {Checked, NoChecked} from '../../assets/svg'

function Checkbox({checked, onChange, children, className}) {
  return (
    <div
      data-testid="checkbox-wrapper"
      onClick={() => onChange && onChange()}
      aria-hidden="true"
      className={`flex items-center cursor-pointer ${className}`}
    >
      {checked && (
        <Checked className="w-4 h-4 mr-2" data-testid="checked-svg" />
      )}
      {!checked && (
        <NoChecked
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
  ]).isRequired,
  className: PropTypes.string,
  onChange: PropTypes.func,
}
