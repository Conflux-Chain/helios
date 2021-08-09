import PropTypes from 'prop-types'

function Circle({
  color = 'bg-gray-80',
  size = 'w-1 h-1',
  className = '',
  containerClassName = '',
}) {
  return (
    <div
      className={`h-4.5 w-4 flex items-center justify-center flex-shrink-0 ${containerClassName}`}
    >
      <div
        className={`rounded-full flex-shrink-0 ${color} ${size} ${className}`}
      />
    </div>
  )
}

Circle.propTypes = {
  color: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
}

export default Circle
