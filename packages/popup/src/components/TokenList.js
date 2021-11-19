import PropTypes from 'prop-types'
import {TokenItem} from './'

function TokenList({tokenList, onSelectToken}) {
  return (
    <div
      className="flex flex-1 flex-col overflow-y-auto relative"
      id="tokenList"
    >
      {tokenList.map((token, index) => (
        <TokenItem
          onSelect={onSelectToken}
          token={token}
          key={index}
          index={index}
        />
      ))}
      <div className="absolute bottom-0 left-0 h-6 bg-token-background w-full" />
    </div>
  )
}

TokenList.propTypes = {
  tokenList: PropTypes.array.isRequired,
  onSelectToken: PropTypes.func,
}

export default TokenList
