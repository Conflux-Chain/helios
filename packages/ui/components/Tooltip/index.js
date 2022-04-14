import React from 'react'
import PropTypes from 'prop-types'
import RcTooltip from 'rc-tooltip'
import useMergedState from 'rc-util/es/hooks/useMergedState'
import classNames from 'classnames'
import getPlacements from './Placements'
import './index.css'

// Fix Tooltip won't hide at disabled button
// mouse events don't trigger at disabled button in Chrome
// https://github.com/react-component/tooltip/issues/18
function getDisabledCompatibleChildren(element) {
  if (element.type === 'button' && element.props.disabled) {
    // reserve display style for <Button style={{ display: 'block '}}></Button>
    // Note:
    //   If people override ant-btn's style.display by css,
    //   it will be affected cause we reset it to 'inline-block'
    const displayStyle =
      element.props.style && element.props.style.display
        ? element.props.style.display
        : 'inline-block'
    const child = React.cloneElement(element, {
      style: {
        ...element.props.style,
        pointerEvents: 'none',
      },
    })
    return (
      <span style={{display: displayStyle, cursor: 'not-allowed'}}>
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
    const {content} = props
    return !content && content !== 0
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
    const {content} = props
    if (content === 0) {
      return content
    }
    return content || ''
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
    React.isValidElement(children) ? children : <span>{children}</span>,
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
