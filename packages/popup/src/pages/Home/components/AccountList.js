import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {Close} from '@fluent-wallet/component-icons'
import {useRPC} from '@fluent-wallet/use-rpc'
import {GET_ALL_ACCOUNT_GROUP} from '../../../constants'
import Button from '@fluent-wallet/component-button'

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

function AccountList({close, accountStatus = false}) {
  const [containerStyle, setContainerStyle] = useState('')
  const {t} = useTranslation()
  const {data: accountGroups} = useRPC([...GET_ALL_ACCOUNT_GROUP])
  const history = useHistory()

  const onClose = () => {
    close()
    setContainerStyle('animate-slide-down')
  }

  useEffect(() => {
    setContainerStyle('hidden')
  }, [])

  useEffect(() => {
    accountStatus && setContainerStyle('animate-slide-up block')
  }, [accountStatus])

  return (
    <div
      className={`bg-bg rounded-t-xl px-3 pt-4 pb-7 absolute w-93 bottom-0 overflow-y-auto no-scroll ${containerStyle} h-[500px] `}
    >
      <div className="ml-3 pb-1">
        <p className="text-base text-gray-80">{t('myAccounts')}</p>
        <div className="flex items-center text-xs mt-1">
          <TemporaryIcon className="w-3 h-3" />
          <div className="text-gray-40 ml-1">current account</div>
          <div className="mx-2 w-px h-2 bg-gray-40" />
          <TemporaryIcon className="w-3 h-3" />
          <div className="text-gray-60 ml-1">current net</div>
        </div>
      </div>
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
      <Close
        onClick={onClose}
        className="w-5 h-5 text-gray-60 cursor-pointer absolute top-3 right-3"
      />
    </div>
  )
}

AccountList.propTypes = {
  close: PropTypes.func.isRequired,
  accountStatus: PropTypes.bool,
}

export default AccountList
