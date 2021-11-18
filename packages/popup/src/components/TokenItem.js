import PropTypes from 'prop-types'
import {DisplayBalance} from './'
import {CFX_DECIMALS} from '@fluent-wallet/data-format'

function TokenItem({
  token = {},
  maxWidthStyle = 'max-w-[175px]',
  maxWidth = 175,
  rightIcon = null,
  onSelect,
  key,
  ...props
}) {
  const {logoURI, name, symbol, balance, decimals} = token

  return (
    <div
      className={`w-full h-14 flex items-center ${
        onSelect ? 'cursor-pointer' : ''
      }`}
      id={`tokenItem${key}`}
      onClick={() => onSelect && onSelect(token)}
      aria-hidden="true"
      {...props}
    >
      <img
        className="w-8 h-8 rounded-full mr-2"
        src={logoURI || '/images/default-token-icon.svg'}
        alt="logo"
      />
      <div className="flex flex-1 flex-col">
        <div className="flex w-full items-center">
          <span className="text-gray-80 font-medium">{symbol}</span>
          <div className="flex items-center flex-1 justify-end">
            <DisplayBalance
              balance={balance}
              maxWidthStyle={maxWidthStyle}
              maxWidth={maxWidth}
              decimals={decimals || CFX_DECIMALS}
            />
            {rightIcon && <span className="ml-5">{rightIcon}</span>}
          </div>
        </div>
        <span className="text-gray-40 text-xs">{name}</span>
      </div>
    </div>
  )
}

TokenItem.propTypes = {
  token: PropTypes.object,
  maxWidthStyle: PropTypes.string,
  maxWidth: PropTypes.number,
  rightIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onSelect: PropTypes.func,
  key: PropTypes.number,
}

export default TokenItem
