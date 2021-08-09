/* eslint-disable no-unused-vars */
import React from 'react'
import PropTypes from 'prop-types'
import RcDropdown from 'rc-dropdown'
import 'rc-dropdown/assets/index.css'
import {ArrowDownOutlined} from '../../assets/svg'
function Dropdown({
  overlay,
  trigger,
  mouseEnterDelay = 0.15,
  mouseLeaveDelay = 0.1,
  transitionName,
  disabled,
  placement,
  children,
  ...props
}) {
  // TODO: custom animation name
  // const getTransitionName = () => {
  //   if (transitionName !== undefined) {
  //     return transitionName
  //   }
  //   if (placement && placement.indexOf('top') >= 0) {
  //     return 'slide-down'
  //   }
  //   return 'slide-up'
  // }

  const renderOverlay = () => {
    // rc-dropdown already can process the function of overlay, but we have check logic here.
    // So we need render the element to check and pass back to rc-dropdown.

    let overlayNode
    if (typeof overlay === 'function') {
      overlayNode = overlay()
    } else {
      overlayNode = overlay
    }
    overlayNode = React.Children.only(
      typeof overlayNode === 'string' ? (
        <span>{overlayNode}</span>
      ) : (
        overlayNode
      ),
    )

    const overlayProps = overlayNode.props

    // menu can be selectable and focusable in dropdown defaultly
    const {selectable = true, focusable = true, expandIcon} = overlayProps

    const overlayNodeExpandIcon =
      typeof expandIcon !== 'undefined' && React.isValidElement(expandIcon) ? (
        expandIcon
      ) : (
        <ArrowDownOutlined className="w-4 h-4 text-gry-40" />
      )

    const fixedModeOverlay =
      typeof overlayNode.type === 'string'
        ? overlayNode
        : React.cloneElement(overlayNode, {
            mode: 'vertical',
            className: 'shadow-2 py-2 my-0.5 bg-gray-0 relative',
            selectable,
            focusable,
            expandIcon: overlayNodeExpandIcon,
          })

    return fixedModeOverlay
  }

  const getPlacement = () => {
    if (placement !== undefined) {
      return placement
    }
    return 'bottomLeft'
  }

  const child = React.Children.only(children)

  const dropdownTrigger = React.cloneElement(child, {
    className: `trigger ${child.props.className || ''}`,
    disabled,
  })

  const triggerActions = disabled ? [] : trigger
  let alignPoint
  if (triggerActions && triggerActions.indexOf('contextMenu') !== -1) {
    alignPoint = true
  }

  return (
    <RcDropdown
      alignPoint={alignPoint}
      // transitionName={getTransitionName()}
      animation="slide-up"
      trigger={triggerActions}
      overlay={() => renderOverlay()}
      placement={getPlacement()}
      {...props}
    >
      {dropdownTrigger}
    </RcDropdown>
  )
}

Dropdown.propTypes = {
  arrow: PropTypes.bool,
  trigger: PropTypes.array,
  overlay: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  onVisibleChange: PropTypes.func,
  visible: PropTypes.bool,
  disabled: PropTypes.bool,
  align: PropTypes.object,
  getPopupContainer: PropTypes.func,
  prefixCls: PropTypes.string,
  className: PropTypes.string,
  transitionName: PropTypes.string,
  placement: PropTypes.oneOf([
    'topLeft',
    'topCenter',
    'topRight',
    'bottomLeft',
    'bottomCenter',
    'bottomRight',
  ]),
  overlayClassName: PropTypes.string,
  overlayStyle: PropTypes.object,
  forceRender: PropTypes.bool,
  mouseEnterDelay: PropTypes.number,
  mouseLeaveDelay: PropTypes.number,
  openClassName: PropTypes.string,
}

export default Dropdown
