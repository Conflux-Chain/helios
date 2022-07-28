import PropTypes from 'prop-types'

function CompWithLabel({label, children, className = '', labelClassName = ''}) {
  return (
    <div className={`mt-3 w-full ${className}`}>
      <span
        className={`text-gray-40 mb-2 inline-block w-full ${labelClassName}`}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

CompWithLabel.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
}

export default CompWithLabel
