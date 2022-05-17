import PropTypes from 'prop-types'
import {AccountItem} from './'
import {RPC_METHODS} from '../../../constants'

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
          .map(({nickname, eid, app}, index) => (
            <AccountItem
              key={index}
              accountNickname={nickname}
              accountId={eid}
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
