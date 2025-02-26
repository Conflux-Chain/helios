import React, {useMemo} from 'react'
import PropTypes from 'prop-types'
import {StopOutlined, CheckCircleFilled} from '@fluent-wallet/component-icons'

function MenuItem({
  children,
  itemKey,
  selected,
  selectedIcon,
  icon,
  onClick,
  disabled,
  containerClassName = '',
}) {
  const style = useMemo(() => {
    if (disabled) return 'text-gray-40 cursor-not-allowed'
    if (selected) return 'bg-gray-0 text-primary cursor-pointer'
    return 'bg-gray-0 text-gray-100 cursor-pointer hover:bg-gray-10 hover:text-primary'
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
      } flex items-center ${style} ${containerClassName}`}
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
          <CheckCircleFilled
            className="w-4 h-4 text-success"
            data-testid="success-filled-wrapper"
          />
        ))}
      {disabled && (
        <StopOutlined
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
  containerClassName: PropTypes.string,
}

export default MenuItem
