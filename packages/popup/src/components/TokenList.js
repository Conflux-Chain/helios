import PropTypes from 'prop-types'
import {TokenItem} from './'
import {isArray} from '@fluent-wallet/checks'

function TokenList({tokenList, onSelectToken, children, contentClassName}) {
  const child = isArray(tokenList)
    ? tokenList.map((token, index) => (
        <TokenItem
          onSelect={onSelectToken}
          token={token}
          key={index}
          index={index}
        />
      ))
    : children

  return (
    <div className="flex flex-1 flex-col relative" id="tokenList">
      <div
        className={`overflow-y-auto no-scroll absolute left-0 right-0 top-0 bottom-0 ${contentClassName}`}
      >
        {child}
      </div>
      <div className="absolute left-0 right-0 bottom-0 h-6 bg-token-background rounded-b-xl" />
    </div>
  )
}

TokenList.propTypes = {
  tokenList: PropTypes.array,
  onSelectToken: PropTypes.func,
  children: PropTypes.node,
  contentClassName: PropTypes.string,
}

export default TokenList
