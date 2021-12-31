import PropTypes from 'prop-types'

function WrapIcon({
  size = 'w-6 h-6',
  children,
  className = '',
  onClick,
  clickable = true,
  ...props
}) {
  return (
    <div
      onClick={e => onClick && onClick(e)}
      aria-hidden="true"
      className={`${size} bg-white shadow-fluent-1 rounded-full flex items-center justify-center ${
        clickable ? 'cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default WrapIcon

WrapIcon.propTypes = {
  size: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  clickable: PropTypes.bool,
}
