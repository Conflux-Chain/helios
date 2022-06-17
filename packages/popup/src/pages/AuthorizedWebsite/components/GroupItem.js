import PropTypes from 'prop-types'
import {AccountItem} from './'
import {RPC_METHODS} from '../../../constants'
import {getAvatarAddress} from '../../../utils'

const {ACCOUNT_GROUP_TYPE} = RPC_METHODS
function GroupItem({groupNickname, account = [], groupType, accountSiteId}) {
  return (
    !!account.length && (
      <div className="bg-gray-0 rounded mt-3">
        {groupType !== ACCOUNT_GROUP_TYPE.PK && (
          <p className="text-gray-40 ml-4 mb-1 text-xs pt-3">{groupNickname}</p>
        )}
        {account
          .filter(({app}) => !!app)
          .map(({nickname, eid, app, address}, index) => (
            <AccountItem
              key={index}
              accountNickname={nickname}
              accountId={eid}
              address={getAvatarAddress(address)}
              app={app}
              accountSiteId={accountSiteId}
            />
          ))}
      </div>
    )
  )
}

GroupItem.propTypes = {
  groupNickname: PropTypes.string,
  groupType: PropTypes.string,
  account: PropTypes.array,
  accountSiteId: PropTypes.object,
}

export default GroupItem
