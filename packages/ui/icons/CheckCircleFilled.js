import PropTypes from 'prop-types'

function CheckCircleFilled({strokeColor = '#fff', ...props}) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx={12} cy={12} r={10} fill="currentColor" />
      <path
        d="M15.5 8.5L11.432 14 9 12.125"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

CheckCircleFilled.propTypes = {
  strokeColor: PropTypes.string,
}
export default CheckCircleFilled
