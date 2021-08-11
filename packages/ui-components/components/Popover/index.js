import * as React from 'react'
import PropTypes from 'prop-types'
import Tooltip from '../Tooltip'
import './index.css'

const Popover = React.forwardRef(
  ({prefixCls: customizePrefixCls, title, content, ...otherProps}, ref) => {
    const getOverlay = prefixCls => (
      <>
        {title && <div className={`${prefixCls}-title`}>{title}</div>}
        <div className={`${prefixCls}-inner-content`}>{content}</div>
      </>
    )

    const prefixCls = customizePrefixCls || 'popover'

    return (
      <Tooltip
        {...otherProps}
        prefixCls={prefixCls}
        ref={ref}
        overlay={getOverlay(prefixCls)}
      />
    )
  },
)

Popover.displayName = 'Popover'

Popover.propTypes = {
  prefixCls: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
}

Popover.defaultProps = {
  placement: 'top',
  trigger: 'hover',
  mouseEnterDelay: 0.1,
  mouseLeaveDelay: 0.1,
  overlayStyle: {},
}

export default Popover
