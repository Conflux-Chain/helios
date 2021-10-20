import PropTypes from 'prop-types'

function CustomTag({
  backgroundColor,
  width = 'w-14',
  className = '',
  children,
}) {
  return (
    <div
      className={`flex h-5 rounded-tr rounded-bl-lg items-center justify-center text-xs ${width} ${backgroundColor} ${className}`}
    >
      {children}
    </div>
  )
}

CustomTag.propTypes = {
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
  width: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}

export default CustomTag
