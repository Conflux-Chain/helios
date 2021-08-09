import PropTypes from 'prop-types'
import MenuItem from './MenuItem'

//TODO: extend menu with rc-menu
function Menu({children, className = '', onClick}) {
  return (
    <div className={`${className}`} onClick={onClick} aria-hidden="true">
      {children}
    </div>
  )
}

Menu.Item = MenuItem
export default Menu

Menu.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
}
