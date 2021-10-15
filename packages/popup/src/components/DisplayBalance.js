import {useRef} from 'react'
import PropTypes from 'prop-types'
import {useFontSize} from '../hooks'
import {formatBalance} from '@fluent-wallet/data-format'

function DisplayBalance({
  maxWidth = 175,
  balance,
  maxWidthStyle = 'max-w-[175px]',
  className = '',
}) {
  const displayBalance = formatBalance(balance)
  const balanceRef = useRef()
  const hiddenRef = useRef()
  useFontSize(balanceRef, hiddenRef, maxWidth, displayBalance)
  return (
    <div
      className={`text-sm text-gray-80 font-mono font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis relative ${maxWidthStyle} ${className}`}
    >
      <span ref={balanceRef}>{displayBalance}</span>
      <span ref={hiddenRef} className="invisible absolute left-0">
        {displayBalance}
      </span>
    </div>
  )
}

DisplayBalance.propTypes = {
  maxWidth: PropTypes.number.isRequired,
  balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  maxWidthStyle: PropTypes.string,
  className: PropTypes.string,
}

export default DisplayBalance
