import {useState, useEffect} from 'react'
import {CFX_DECIMALS} from '@fluent-wallet/data-format'
import PropTypes from 'prop-types'
import Text from './Text'
import {
  useSingleAddressTokenBalanceWithNativeTokenSupport,
  useSingleTokenInfoWithNativeTokenSupport,
} from '../hooks/useApi'
import {DisplayBalance} from './'

const getTokenItem = t => {
  const rst = [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSingleTokenInfoWithNativeTokenSupport(t),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSingleAddressTokenBalanceWithNativeTokenSupport({
      tokenId: t,
    }),
  ]
  if (t?.name) {
    return [{...t}, t?.balance]
  }

  return rst
}

function TokenItem({
  token = {},
  maxWidthStyle = 'max-w-[175px]',
  maxWidth = 175,
  rightIcon = null,
  onSelect,
  index,
  ...props
}) {
  const [state, balance] = getTokenItem(token)

  // In order for cfx that exist locally to appear with other coins as much as possible
  const [nextTickState, setNextTickState] = useState(() => {})
  const {logoURI, name, symbol, decimals} =
    token === 'native' ? nextTickState ?? {} : state
  useEffect(() => {
    if (token === 'native') {
      setTimeout(() => setNextTickState(state), 50)
    }
  }, [token, state])

  return (
    <div
      className={`w-full h-14 flex items-center flex-shrink-0 ${
        onSelect ? 'cursor-pointer' : ''
      } hover:bg-primary-4 px-2`}
      id={`tokenItem${index}`}
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
          <Text
            className="text-gray-80 font-medium"
            text={symbol}
            skeleton="min-w-[3rem]"
          />
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
        <Text
          className="text-gray-40 text-xs mt-[.1rem]"
          text={name}
          skeleton="min-w-[6rem]"
        />
      </div>
    </div>
  )
}

TokenItem.propTypes = {
  token: PropTypes.oneOfType([
    // add token list
    PropTypes.shape({eid: PropTypes.number, added: PropTypes.bool}),
    // token id
    PropTypes.number,
    // "native"
    PropTypes.string,
  ]),
  maxWidthStyle: PropTypes.string,
  maxWidth: PropTypes.number,
  rightIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onSelect: PropTypes.func,
  index: PropTypes.number,
}

export default TokenItem
