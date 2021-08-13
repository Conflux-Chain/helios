import React from 'react'
import PropTypes from 'prop-types'
import {SuccessFilled, Disabled} from '../../assets/svg'

const {useMemo} = React
function MenuItem({
  children,
  itemKey,
  selected,
  selectedIcon,
  icon,
  onClick,
  disabled,
}) {
  const style = useMemo(() => {
    if (disabled) return 'text-gray-40 cursor-not-allowed'
    if (selected) return 'bg-gray-0 text-primary cursor-poiniter'
    return 'bg-gray-0 text-gray-100 cursor-poiniter hover:bg-gray-10 hover:text-primary'
  }, [disabled, selected])

  const iconComp = icon
    ? React.cloneElement(icon, {
        className: `mr-2 w-6 h-6 ${icon.props.className || ''}`,
      })
    : null

  const selectedIconComp = selectedIcon
    ? React.cloneElement(selectedIcon, {
        className: `w-4 h-4 ${selectedIcon.props.className || ''}`,
      })
    : null

  return (
    <div
      data-testid="menu-item-wrapper"
      key={itemKey}
      aria-hidden="true"
      onClick={() => !disabled && onClick && onClick(itemKey)}
      className={`w-50 h-12 ${
        icon ? 'px-4' : 'pl-12 pr-4'
      } flex items-center ${style}`}
    >
      <div className="flex items-center flex-1">
        {iconComp}
        {children}
      </div>
      {!disabled &&
        selected &&
        (selectedIcon ? (
          selectedIconComp
        ) : (
          <SuccessFilled
            className="w-4 h-4"
            data-testid="success-icon-wrapper"
          />
        ))}
      {disabled && (
        <Disabled
          className="text-gray-40 w-4 h-4"
          data-testid="disable-icon-wrapper"
        />
      )}
    </div>
  )
}

MenuItem.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  itemKey: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  selectedIcon: PropTypes.node,
  icon: PropTypes.node,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
}

export default MenuItem
