import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {useRPC} from '@fluent-wallet/use-rpc'
import {GET_ALL_ACCOUNT_GROUP} from '../../../constants'
import Button from '@fluent-wallet/component-button'

// TODO: remove when avatar programme confirmed
// eslint-disable-next-line react/prop-types
function TemporaryIcon({className = ''}) {
  return (
    <div className={`inline-block bg-gray-40 rounded-full ${className}`}></div>
  )
}

function AccountGroup({nickname, account}) {
  // TODO: 根据account的eid和networkId 查询rpc确认当前账户的地址。获取token balance。根据当前networkId 和 all network rpc 接口。确认当前币种单位。
  return (
    <div className="bg-gray-0 rounded pt-3 mt-3">
      <p className="text-gray-40 ml-4 mb-1 text-xs">{nickname}</p>
      {account.map(({nickname, eid}, index) => (
        <div
          key={index}
          className="flex p-3 rounded hover:bg-primary-4 cursor-pointer"
        >
          <TemporaryIcon className="w-5 h-5 mr-2" />
          <div className="flex-1">
            <p className="text-xs text-gray-40">{nickname}</p>
            <p className="text-sm text-gray-80">
              12345
              <span>CFX</span>
            </p>
          </div>
          <TemporaryIcon className="w-6 h-6 mt-1.5" />
        </div>
      ))}
    </div>
  )
}

AccountGroup.propTypes = {
  nickname: PropTypes.string,
  account: PropTypes.array,
}

function AccountList() {
  const {t} = useTranslation()
  const {data: accountGroups} = useRPC([...GET_ALL_ACCOUNT_GROUP])
  const history = useHistory()

  return (
    <>
      <div>
        {accountGroups.map(({nickname, account}, index) => (
          <AccountGroup key={index} account={account} nickname={nickname} />
        ))}
      </div>
      <Button
        color="transparent"
        className="w-full border-dashed border-gray-40 mt-3 text-gray-80"
        onClick={() => {
          history.push('/select-create-type')
        }}
      >
        {t('addAccount')}
      </Button>
    </>
  )
}

export default AccountList
