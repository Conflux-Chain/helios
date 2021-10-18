import PropTypes from 'prop-types'
import {TokenItem} from './index'

function TokenList({tokenList, onSelectToken}) {
  console.log(tokenList)
  return (
    <div className="flex flex-1 flex-col overflow-y-auto relative">
      <TokenItem onSelect={onSelectToken} />
      <div className="absolute bottom-0 left-0 h-6 bg-token-background w-[356px]" />
    </div>
  )
}

TokenList.propTypes = {
  tokenList: PropTypes.array.isRequired,
  onSelectToken: PropTypes.func,
}

export default TokenList
