import PropTypes from 'prop-types'
import {DisplayBalance} from './index'

function TokenItem({
  token = {},
  balance = '123456789100200300400.123456',
  maxWidthStyle = 'max-w-[175px]',
  maxWidth = 175,
  rightIcon = null,
  onSelect,
}) {
  const {icon, name = 'Conflux', symbol = 'CFX'} = token

  return (
    <div
      className="w-full h-14 flex items-center"
      onClick={() => onSelect && onSelect(token)}
      aria-hidden="true"
    >
      <img
        className="w-8 h-8 rounded-full mr-2"
        src={icon || 'images/default-token-icon.svg'}
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
  token: PropTypes.object.isRequired,
  balance: PropTypes.string,
  maxWidthStyle: PropTypes.string,
  maxWidth: PropTypes.number,
  rightIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onSelect: PropTypes.func,
}

export default TokenItem
