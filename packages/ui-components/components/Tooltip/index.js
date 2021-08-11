import * as React from 'react'
import PropTypes from 'prop-types'
import RcTooltip from 'rc-tooltip'
import useMergedState from 'rc-util/lib/hooks/useMergedState'
import classNames from 'classnames'
import getPlacements from './Placements'
import './index.css'

const splitObject = (obj, keys) => {
  const picked = {}
  const omitted = {...obj}
  keys.forEach(key => {
    if (obj && key in obj) {
      picked[key] = obj[key]
      delete omitted[key]
    }
  })
  return {picked, omitted}
}

// Fix Tooltip won't hide at disabled button
// mouse events don't trigger at disabled button in Chrome
// https://github.com/react-component/tooltip/issues/18
function getDisabledCompatibleChildren(element, prefixCls) {
  const elementType = element.type
  if (
    (elementType.__ANT_BUTTON === true ||
      elementType.__ANT_SWITCH === true ||
      elementType.__ANT_CHECKBOX === true ||
      element.type === 'button') &&
    element.props.disabled
  ) {
    // Pick some layout related style properties up to span
    // Prevent layout bugs like https://github.com/ant-design/ant-design/issues/5254
    const {picked, omitted} = splitObject(element.props.style, [
      'position',
      'left',
      'right',
      'top',
      'bottom',
      'float',
      'display',
      'zIndex',
    ])
    const spanStyle = {
      display: 'inline-block', // default inline-block is important
      ...picked,
      cursor: 'not-allowed',
      width: element.props.block ? '100%' : null,
    }
    const buttonStyle = {
      ...omitted,
      pointerEvents: 'none',
    }
    const child = React.cloneElement(element, {
      style: buttonStyle,
      className: null,
    })
    return (
      <span
        style={spanStyle}
        className={classNames(
          element.props.className,
          `${prefixCls}-disabled-compatible-wrapper`,
        )}
      >
        {child}
      </span>
    )
  }
  return element
}

const Tooltip = React.forwardRef((props, ref) => {
  const [visible, setVisible] = useMergedState(false, {
    value: props.visible,
    defaultValue: props.defaultVisible,
  })

  const isNoContent = () => {
    const {content, overlay} = props
    return !content && !overlay && content !== 0 // overlay for old version compatibility
  }

  const onVisibleChange = vis => {
    setVisible(isNoContent() ? false : vis)

    if (!isNoContent()) {
      props.onVisibleChange?.(vis)
    }
  }

  const getTooltipPlacements = () => {
    const {builtinPlacements, arrowPointAtCenter, autoAdjustOverflow} = props
    return (
      builtinPlacements ||
      getPlacements({
        arrowPointAtCenter,
        autoAdjustOverflow,
      })
    )
  }

  // 动态设置动画点
  const onPopupAlign = (domNode, align) => {
    const placements = getTooltipPlacements()
    // 当前返回的位置
    const placement = Object.keys(placements).filter(
      key =>
        placements[key].points[0] === align.points[0] &&
        placements[key].points[1] === align.points[1],
    )[0]
    if (!placement) {
      return
    }
    // 根据当前坐标设置动画点
    const rect = domNode.getBoundingClientRect()
    const transformOrigin = {
      top: '50%',
      left: '50%',
    }
    if (placement.indexOf('top') >= 0 || placement.indexOf('Bottom') >= 0) {
      transformOrigin.top = `${rect.height - align.offset[1]}px`
    } else if (
      placement.indexOf('Top') >= 0 ||
      placement.indexOf('bottom') >= 0
    ) {
      transformOrigin.top = `${-align.offset[1]}px`
    }
    if (placement.indexOf('left') >= 0 || placement.indexOf('Right') >= 0) {
      transformOrigin.left = `${rect.width - align.offset[0]}px`
    } else if (
      placement.indexOf('right') >= 0 ||
      placement.indexOf('Left') >= 0
    ) {
      transformOrigin.left = `${-align.offset[0]}px`
    }
    domNode.style.transformOrigin = `${transformOrigin.left} ${transformOrigin.top}`
  }

  const getOverlay = () => {
    const {content, overlay} = props
    if (content === 0) {
      return content
    }
    return overlay || content || ''
  }

  const {getPopupContainer, ...otherProps} = props

  const {
    openClassName,
    getTooltipContainer,
    overlayClassName,
    overlayInnerStyle,
    children,
    prefixCls: customPrefixCls,
  } = props
  const prefixCls = customPrefixCls || 'tooltip'

  let tempVisible = visible
  // Hide tooltip when there is no content
  if (!('visible' in props) && isNoContent()) {
    tempVisible = false
  }

  const child = getDisabledCompatibleChildren(
    typeof children !== 'string' ? children : <span>{children}</span>,
    prefixCls,
  )
  const childProps = child.props
  const childCls = classNames(childProps.className, {
    [openClassName || `${prefixCls}-open`]: true,
  })

  const customOverlayClassName = overlayClassName

  let formattedOverlayInnerStyle = overlayInnerStyle
  let arrowContentStyle

  return (
    <RcTooltip
      {...otherProps}
      prefixCls={prefixCls}
      overlayClassName={customOverlayClassName}
      getTooltipContainer={getPopupContainer || getTooltipContainer}
      ref={ref}
      builtinPlacements={getTooltipPlacements()}
      overlay={getOverlay()}
      visible={tempVisible}
      onVisibleChange={onVisibleChange}
      onPopupAlign={onPopupAlign}
      overlayInnerStyle={formattedOverlayInnerStyle}
      arrowContent={
        <span
          className={`${prefixCls}-arrow-content`}
          style={arrowContentStyle}
        />
      }
      motion={{
        motionName: 'zoom-big-fast',
        motionDeadline: 1000,
      }}
    >
      {tempVisible ? React.cloneElement(child, {className: childCls}) : child}
    </RcTooltip>
  )
})

Tooltip.displayName = 'Tooltip'

Tooltip.propTypes = {
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  overlay: PropTypes.bool,
  visible: PropTypes.bool,
  defaultVisible: PropTypes.bool,
  getPopupContainer: PropTypes.func,
  getTooltipContainer: PropTypes.func,
  onVisibleChange: PropTypes.func,
  openClassName: PropTypes.string,
  overlayClassName: PropTypes.string,
  overlayInnerStyle: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  builtinPlacements: PropTypes.string,
  arrowPointAtCenter: PropTypes.bool,
  autoAdjustOverflow: PropTypes.bool,
  prefixCls: PropTypes.string,
}

Tooltip.defaultProps = {
  placement: 'top',
  mouseEnterDelay: 0.1,
  mouseLeaveDelay: 0.1,
  arrowPointAtCenter: false,
  autoAdjustOverflow: true,
}

export default Tooltip
