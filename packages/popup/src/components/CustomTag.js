import PropTypes from 'prop-types'

function CustomTag({
  backgroundColor,
  width = 'w-14',
  className = '',
  children,
  roundedStyle = 'rounded-tr rounded-bl-lg',
}) {
  return (
    <div
      id="customTag"
      className={`flex h-5 items-center justify-center text-xs ${width} ${backgroundColor} ${className} ${roundedStyle}`}
    >
      {children}
    </div>
  )
}

CustomTag.propTypes = {
  backgroundColor: PropTypes.string,
  width: PropTypes.string,
  roundedStyle: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}

export default CustomTag
