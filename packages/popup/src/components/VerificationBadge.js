import PropTypes from 'prop-types'
import Tooltip from '@fluent-wallet/component-tooltip'
import {useTranslation} from 'react-i18next'

const NotableIcon = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="8"
    height="8"
    viewBox="0 0 8 8"
    fill="none"
    {...props}
  >
    <g clipPath="url(#clip0_135033_136)">
      <path
        d="M7.75478 3.40485L7.0767 2.72677V1.76902C7.0767 1.54528 6.98788 1.33069 6.82976 1.17239C6.67164 1.01409 6.45715 0.925029 6.23341 0.924775H5.27567L4.59663 0.246694C4.43843 0.0887257 4.224 0 4.00043 0C3.77687 0 3.56244 0.0887257 3.40424 0.246694L2.72616 0.924775H1.76841C1.54467 0.924775 1.33008 1.01359 1.17178 1.17171C1.01348 1.32983 0.924419 1.54432 0.924165 1.76807V2.72581L0.246083 3.40485C0.0881154 3.56305 -0.000610352 3.77748 -0.000610352 4.00104C-0.000610352 4.22461 0.0881154 4.43904 0.246083 4.59724L0.924165 5.27532V6.23306C0.924545 6.45656 1.01353 6.67078 1.17161 6.82877C1.32969 6.98676 1.54396 7.07562 1.76746 7.07587H2.7252L3.40328 7.75396C3.56167 7.91157 3.77602 8.00006 3.99947 8.00006C4.22292 8.00006 4.43728 7.91157 4.59567 7.75396L5.27471 7.07587H6.23245C6.45603 7.07562 6.67038 6.98669 6.82847 6.8286C6.98656 6.67051 7.07549 6.45616 7.07574 6.23258V5.27484L7.75382 4.59676C7.91179 4.43856 8.00052 4.22413 8.00052 4.00056C8.00052 3.777 7.91179 3.56257 7.75382 3.40437L7.75478 3.40485Z"
        fill="#1E3DE4"
      />
      <path
        d="M2.96155 4.06195L3.75478 4.87145L4.96325 3.27008"
        strokeWidth="0.665"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_135033_136">
        <rect width="8" height="8" fill="white" />
      </clipPath>
    </defs>
  </svg>
)
const VerifiedIcon = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="9"
    height="8"
    viewBox="0 0 9 8"
    fill="none"
    {...props}
  >
    <circle cx="4" cy="4" r="4" fill="#7CD77B" />
    <path
      d="M7.43387 1.03014C7.62322 0.840593 7.93037 0.84044 8.11992 1.02979C8.29223 1.20193 8.30802 1.47143 8.1672 1.66141L8.12026 1.71584L4.23939 5.60059C4.06719 5.77296 3.79758 5.78869 3.6076 5.64774L3.55317 5.60076L2.38891 4.4365C2.19946 4.24705 2.19946 3.9399 2.38891 3.75045C2.56114 3.57823 2.83064 3.56257 3.02055 3.70348L3.07496 3.75045L3.89554 4.571L7.43387 1.03014Z"
      fill="white"
    />
  </svg>
)
const UnverifiedIcon = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="8"
    height="8"
    viewBox="0 0 8 8"
    fill="none"
    {...props}
  >
    <g clipPath="url(#clip0_135033_343)">
      <path
        d="M4 7.5C5.93298 7.5 7.5 5.93298 7.5 4C7.5 2.067 5.93298 0.5 4 0.5C2.067 0.5 0.5 2.067 0.5 4C0.5 5.93298 2.067 7.5 4 7.5Z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#FA953C"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#FA953C"
      />
      <path
        d="M3.99995 2.59998V3.99998"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="white"
      />
      <path
        d="M4 5.39996H4.0035"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_135033_343">
        <rect width="8" height="8" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const STATUS_CONFIG = {
  notable: {Icon: NotableIcon, translationKey: 'Notable'},
  verified: {Icon: VerifiedIcon, translationKey: 'Verified'},
  unverified: {Icon: UnverifiedIcon, translationKey: 'Unverified'},
}

function VerificationBadge({
  kind,
  isNotable,
  isVerified,
  visible = true,
  children,
}) {
  const {t} = useTranslation()
  const status = isNotable
    ? 'notable'
    : isVerified === true
    ? 'verified'
    : isVerified === false
    ? 'unverified'
    : null

  if (!visible || !status) return children

  const {Icon, translationKey} = STATUS_CONFIG[status]
  return (
    <div className="relative shrink-0">
      <Tooltip
        content={
          <div>
            <div className="text-white text-[11px] font-medium">
              {t(`${kind}${translationKey}Title`)}
            </div>
            <div className="text-[#D1D9E5] text-[11px] font-normal">
              {t(`${kind}${translationKey}Desc`)}
            </div>
          </div>
        }
      >
        {children}
        <Icon className="absolute right-0 bottom-0 w-[50%] h-[50%]" />
      </Tooltip>
    </div>
  )
}

VerificationBadge.propTypes = {
  kind: PropTypes.oneOf(['token', 'contract']).isRequired,
  isNotable: PropTypes.bool,
  isVerified: PropTypes.bool,
  visible: PropTypes.bool,
  children: PropTypes.element.isRequired,
}

export default VerificationBadge
