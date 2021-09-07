import PropTypes from 'prop-types'

function CompWithLabel({label, children, className = ''}) {
  return (
    <div className={`mt-3 ${className}`}>
      <span className="text-gray-80 ml-1 mb-2 inline-block">{label}</span>
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
}

export default CompWithLabel
