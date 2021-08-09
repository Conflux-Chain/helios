import PropTypes from 'prop-types'
import {CircleBg, SquareBg} from '../../assets/svg'

function WrapIcon({
  type,
  size = 'w-4 h-4',
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
      className={`${size} relative flex justify-center items-center ${
        clickable ? 'cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {type === 'circle' && <CircleBg className={size} />}
      {type === 'square' && <SquareBg className={size} />}
      <div
        className={`${size} absolute inset-0 flex justify-center items-center text-gray-40`}
      >
        {children}
      </div>
    </div>
  )
}

export default WrapIcon

WrapIcon.propTypes = {
  type: PropTypes.oneOf(['circle', 'square']).isRequired,
  size: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  clickable: PropTypes.bool,
}
