import PropTypes from 'prop-types'
import {
  LeftSwitchOutlined,
  RightSwitchOutlined,
} from '@fluent-wallet/component-icons'

function SwitchInner({
  showLeft,
  leftSwitchClassName = '',
  rightSwitchClassName = '',
}) {
  return (
    <div>
      {showLeft ? (
        <LeftSwitchOutlined
          className={`w-4 h-4 text-gray-40 ${leftSwitchClassName}`}
        />
      ) : (
        <RightSwitchOutlined
          className={`w-4 h-4 text-primary ${rightSwitchClassName}`}
        />
      )}
    </div>
  )
}

SwitchInner.propTypes = {
  showLeft: PropTypes.bool.isRequired,
  leftSwitchClassName: PropTypes.string,
  rightSwitchClassName: PropTypes.string,
}

function SwitchButtonGroup({
  Wrapper,
  onSwitch,
  showLeft,
  containerClassName,
  ...props
}) {
  return Wrapper ? (
    <Wrapper
      id="switch-btn-group"
      className={containerClassName}
      onClick={() => onSwitch?.(!showLeft)}
    >
      <SwitchInner showLeft={showLeft} {...props} />
    </Wrapper>
  ) : (
    <div
      aria-hidden
      id="switch-btn-group"
      onClick={() => onSwitch?.(!showLeft)}
      className={`cursor-pointer ${containerClassName}`}
    >
      <SwitchInner showLeft={showLeft} {...props} />
    </div>
  )
}
SwitchButtonGroup.propTypes = {
  showLeft: PropTypes.bool.isRequired,
  onSwitch: PropTypes.func.isRequired,
  Wrapper: PropTypes.elementType,
  containerClassName: PropTypes.string,
}
export default SwitchButtonGroup
