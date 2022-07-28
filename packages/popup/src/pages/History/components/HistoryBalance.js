import PropTypes from 'prop-types'
import {DisplayBalance} from '../../../components'

function HistoryBalance({
  amount = '',
  symbol = '',
  balanceMaxWidth = 114,
  maxWidthStyle = 'max-w-[114px]',
  symbolClassName = 'text-2xs',
  className = '',
  balanceFontSize = 14,
  showNegative = false,
  ...props
}) {
  return amount ? (
    <div className={`flex items-center ${className}`}>
      {showNegative && <span>-</span>}
      <DisplayBalance
        balance={amount}
        maxWidth={balanceMaxWidth}
        maxWidthStyle={maxWidthStyle}
        initialFontSize={balanceFontSize}
        {...props}
      />
      <span className={`text-gray-60 ml-0.5 ${symbolClassName}`}>{symbol}</span>
    </div>
  ) : null
}

HistoryBalance.propTypes = {
  className: PropTypes.string,
  amount: PropTypes.string,
  symbol: PropTypes.string,
  symbolClassName: PropTypes.string,
  balanceFontSize: PropTypes.number,
  balanceMaxWidth: PropTypes.number,
  maxWidthStyle: PropTypes.string,
  showNegative: PropTypes.bool,
}

export default HistoryBalance
