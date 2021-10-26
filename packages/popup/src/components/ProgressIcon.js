import PropTypes from 'prop-types'

function ProgressIcon({direction = 'horizontal', middleIcon, dashLengthStyle}) {
  const directionStyle = direction === 'horizontal' ? 'flex-row' : 'flex-col'
  const dashOffsetStyle = direction === 'horizontal' ? 'ml-1' : 'mt-1'
  return (
    <div className={`flex justify-center items-center ${directionStyle}`}>
      <div className="w-2 h-2 border-solid border-primary border-2 rounded-full" />
      <div
        className={`border border-gray-40 border-dashed ${dashOffsetStyle} ${dashLengthStyle}`}
      />
      {middleIcon}
      <div
        className={`border border-gray-40 border-dashed ${dashLengthStyle}`}
      />
      <div
        className={`w-2 h-2 border-solid border-warning border-2 rounded-full ${dashOffsetStyle}`}
      />
    </div>
  )
}

ProgressIcon.propTypes = {
  direction: PropTypes.oneOf(['horizontal', 'vertical']),
  dashLengthStyle: PropTypes.string.isRequired,
  middleIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
    .isRequired,
}
export default ProgressIcon
