import PropTypes from 'prop-types'
import {formatIntoShortAddress} from '../utils'

function DappTransactionHeader({
  title,
  avatar,
  nickName,
  address,
  rightContent = null,
}) {
  return (
    <header>
      <p className="text-sm text-gray-100 text-center h-13 flex justify-center items-center">
        {title}
      </p>
      <div className="flex mt-1 px-4 pb-3 items-center justify-between">
        <div className="flex">
          {avatar}
          <div>
            <p className="text-xs text-gray-40">{nickName}</p>
            <p className="text-sm text-gray-80 font-medium">
              {formatIntoShortAddress(address)}
            </p>
          </div>
        </div>
        {rightContent}
      </div>
    </header>
  )
}

DappTransactionHeader.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  avatar: PropTypes.node.isRequired,
  nickName: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  rightContent: PropTypes.node,
}

export default DappTransactionHeader
