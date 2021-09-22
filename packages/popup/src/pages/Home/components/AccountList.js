import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {useRPC} from '@fluent-wallet/use-rpc'
import {isNumber} from '@fluent-wallet/checks'
import {useEffect} from 'react'
import {ROUTES, RPC_METHODS} from '../../../constants'
import Button from '@fluent-wallet/component-button'
import {request} from '../../../utils'
const {SELECT_CREATE_TYPE} = ROUTES
const {
  GET_ACCOUNT_GROUP,
  GET_CURRENT_NETWORK,
  GET_ACCOUNT_ADDRESS_BY_NETWORK,
  GET_BALANCE,
  ACCOUNT_GROUP_TYPE,
} = RPC_METHODS

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
          <img className="w-5 h-5 mr-2" src="" alt="avatar" />
          <div className="flex-1">
            <p className="text-xs text-gray-40">{nickname}</p>
            <p className="text-sm text-gray-80">
              12345
              <span>CFX</span>
            </p>
          </div>
          <div className="w-6 h-6 border-gray-20 border border-solid rounded-full mt-1.5 flex justify-center items-center">
            <img className="w-4 h-4" src="" alt="favicon" />
          </div>
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
  const {data: accountGroups} = useRPC([
    GET_ACCOUNT_GROUP,
    ACCOUNT_GROUP_TYPE.HD,
  ])
  const {
    data: {eid: networkId},
  } = useRPC([GET_CURRENT_NETWORK])
  const history = useHistory()
  const onAddAccount = () => {
    history.push('?open=account-list')
    history.push(SELECT_CREATE_TYPE)
  }

  useEffect(() => {
    if (isNumber(networkId) && accountGroups.length) {
      const addressParams = accountGroups.reduce((acc, cur) => {
        console.log('cur', cur)
        return (
          acc.concat(
            cur.account.map(({eid: accountId}) => ({networkId, accountId})),
          ),
          []
        )
      })
      request(GET_ACCOUNT_ADDRESS_BY_NETWORK, addressParams).then(addresses => {
        console.log('addresses', addresses)
      })
      // console.log(accounts, networkId)
      // Promise.all(
      //   accounts.map(({eid: accountId}) =>
      //     request(GET_ACCOUNT_ADDRESS_BY_NETWORK, {
      //       networkId: networkId,
      //       accountId,
      //     }),
      //   ),
      // ).then(addresses => {
      //   console.log('addresses', addresses)

      //   if (addresses.every(addr => addr.result)) {
      //     request(
      //       GET_BALANCE,
      //       [addresses[0].result.base32],
      //       // addresses.map(addr => addr.result.base32 || addr.result.hex),
      //     ).then(({result, error}) => {
      //       // console.log('result', result, error)
      //     })
      //   }
      // })
    }
  }, [networkId, accountGroups])
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
        onClick={onAddAccount}
      >
        {t('addAccount')}
      </Button>
    </>
  )
}

export default AccountList
