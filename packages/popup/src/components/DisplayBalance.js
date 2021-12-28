import {useRef} from 'react'
import PropTypes from 'prop-types'
import {
  formatBalance,
  roundBalance,
  COMMON_DECIMALS,
  convertDataToValue,
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
  symbol = '',
  decimals = COMMON_DECIMALS,
  id,
}) {
  let displayBalance
  let displayRealBalance
  if (balance) {
    if (isHexPrefixed(balance)) {
      displayBalance = formatBalance(balance, decimals)
      displayRealBalance = convertDataToValue(balance, decimals)
    } else {
      displayBalance = roundBalance(balance)
      displayRealBalance = balance
    }
  }
  const showTooltip = displayBalance === '<0.000001'
  const balanceRef = useRef()
  const hiddenRef = useRef()
  useFontSize(balanceRef, hiddenRef, maxWidth, displayBalance, initialFontSize)
  return (
    <div
      className={`flex text-gray-80 font-mono font-semibold items-center ${className}`}
    >
      <div id={id} className={`text-ellipsis relative ${maxWidthStyle}`}>
        {showTooltip ? (
          <Tooltip content={`${displayRealBalance} ${symbol}`}>
            <span ref={balanceRef}>{displayBalance}</span>
          </Tooltip>
        ) : (
          <span ref={balanceRef}>{displayBalance}</span>
        )}

        <span ref={hiddenRef} className="invisible absolute left-0">
          {displayBalance}
        </span>
      </div>
      <span className="inline-block ml-0.5">{`${symbol}`}</span>
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
