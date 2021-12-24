import {useRef} from 'react'
import PropTypes from 'prop-types'
import {
  formatBalance,
  roundBalance,
  COMMON_DECIMALS,
  Big,
} from '@fluent-wallet/data-format'
import {isHexPrefixed} from '@fluent-wallet/utils'
import Tooltip from '@fluent-wallet/component-tooltip'
import {useFontSize} from '../hooks'

function DisplayBalance({
  maxWidth = 175,
  balance,
  maxWidthStyle = 'max-w-[175px]',
  className = '',
  initialFontSize = 14,
  symbol,
  decimals = COMMON_DECIMALS,
  id,
}) {
  let displayBalance
  let showTooltip
  if (balance) {
    if (isHexPrefixed(balance)) {
      displayBalance = formatBalance(balance, decimals)
    } else {
      const bigBalance = new Big(balance)
      showTooltip = bigBalance.lt(Big(1e-6)) && !bigBalance.eq(0)
      if (showTooltip) {
        displayBalance = '0.000000...'
      } else {
        displayBalance = roundBalance(balance)
      }
    }
  }
  const balanceRef = useRef()
  const hiddenRef = useRef()
  useFontSize(balanceRef, hiddenRef, maxWidth, displayBalance, initialFontSize)
  return (
    <div
      id={id}
      className={`text-gray-80 font-mono font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis relative ${maxWidthStyle} ${className}`}
    >
      <Tooltip content={`${balance} ${symbol}`}>
        <span ref={balanceRef}>{displayBalance}</span>
        {symbol && ` ${symbol}`}
      </Tooltip>
      <span ref={hiddenRef} className="invisible absolute left-0">
        {displayBalance}
      </span>
    </div>
  )
}

DisplayBalance.propTypes = {
  maxWidth: PropTypes.number.isRequired,
  balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxWidthStyle: PropTypes.string,
  className: PropTypes.string,
  initialFontSize: PropTypes.number,
  symbol: PropTypes.string,
  decimals: PropTypes.number,
  id: PropTypes.string,
}

export default DisplayBalance
