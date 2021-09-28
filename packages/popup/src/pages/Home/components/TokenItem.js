import PropTypes from 'prop-types'
import {useFontSize} from '../../../hooks'
import {useRef} from 'react'
import {formatBalance} from '@fluent-wallet/data-format'

const maxBalanceWidthStyleObj = {
  small: 'max-w-[135px]',
  medium: 'max-w-[175px]',
}
const maxBalanceWidth = {
  small: 135,
  medium: 175,
}

function TokenItem({
  icon,
  name = 'Conflux',
  symbol = 'CFX',
  balance = '123456789100200300400.123456',
  maxBalanceSize = 'medium',
  rightIcon = null,
}) {
  const balanceRef = useRef()
  const hiddenRef = useRef()
  const maxBalanceWidthStyle = maxBalanceWidthStyleObj[maxBalanceSize]
  useFontSize(balanceRef, hiddenRef, maxBalanceWidth[maxBalanceSize], balance)

  return (
    <div className="w-full h-14 flex items-center">
      <img className="w-8 h-8 rounded-full mr-2" src={icon} alt="logo" />
      <div className="flex flex-1 flex-col">
        <div className="flex w-full items-center">
          <span className="text-gray-80 font-medium">{symbol}</span>
          <div className="flex items-center flex-1 justify-end">
            <div
              className={`${maxBalanceWidthStyle} text-sm text-gray-80 font-mono font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis`}
            >
              <span ref={balanceRef}>{formatBalance(balance)}</span>
              <span ref={hiddenRef} className="invisible">
                {formatBalance(balance)}
              </span>
            </div>
            {rightIcon && <span className="ml-5">{rightIcon}</span>}
          </div>
        </div>
        <span className="text-gray-40 text-xs">{name}</span>
      </div>
      {rightIcon && <span className="ml-5">{rightIcon}</span>}
    </div>
  )
}

TokenItem.propTypes = {
  icon: PropTypes.string,
  name: PropTypes.string,
  symbol: PropTypes.string,
  balance: PropTypes.string,
  maxBalanceSize: PropTypes.oneOf(['small', 'medium']),
  rightIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
}

export default TokenItem
