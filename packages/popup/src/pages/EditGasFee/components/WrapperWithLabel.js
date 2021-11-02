import PropTypes from 'prop-types'

function WrapperWithLabel({
  leftContent,
  rightContent,
  leftClass = '',
  rightClass = '',
  containerClass = '',
}) {
  return (
    <div
      className={`text-sm flex justify-between mx-4 items-center ${containerClass}`}
    >
      <div className={`text-gray-40 ${leftClass}`}>{leftContent}</div>
      <div className={rightClass}>{rightContent}</div>
    </div>
  )
}

WrapperWithLabel.propTypes = {
  leftContent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
  rightContent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
  leftClass: PropTypes.string,
  rightClass: PropTypes.string,
  containerClass: PropTypes.string,
}

export default WrapperWithLabel
