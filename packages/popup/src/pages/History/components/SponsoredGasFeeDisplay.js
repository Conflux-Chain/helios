import PropTypes from 'prop-types'
import DisplayBalance from '../../../components/DisplayBalance'

function SponsoredGasFeeDisplay({amount, symbol}) {
  return (
    <div className="flex items-center">
      <DisplayBalance
        balance={amount}
        symbol={symbol}
        inlineSymbol
        className="text-sm !font-medium !text-gray-40 line-through"
        initialFontSize={14}
      />
      <DisplayBalance
        balance="0x0"
        symbol={symbol}
        inlineSymbol
        className="ml-2 text-sm !font-medium !text-gray-80"
        initialFontSize={14}
      />
    </div>
  )
}

SponsoredGasFeeDisplay.propTypes = {
  amount: PropTypes.string.isRequired,
  symbol: PropTypes.string,
}

export default SponsoredGasFeeDisplay
