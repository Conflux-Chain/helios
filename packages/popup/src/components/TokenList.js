import PropTypes from 'prop-types'
import {TokenItem} from './'

function TokenList({tokenList, onSelectToken}) {
  return (
    <div
      className="flex flex-1 flex-col overflow-y-auto no-scroll pb-3"
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
    </div>
  )
}

TokenList.propTypes = {
  tokenList: PropTypes.array.isRequired,
  onSelectToken: PropTypes.func,
}

export default TokenList
