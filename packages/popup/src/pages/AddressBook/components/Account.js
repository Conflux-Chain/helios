import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'

import {useAccountList, useCurrentAddress} from '../../../hooks/useApi'
import {
  NoResult,
  AccountGroupItem,
  AccountItem,
  LedgerGroupTag,
} from '../../../components'
import {NETWORK_TYPE, RPC_METHODS} from '../../../constants'

const {ACCOUNT_GROUP_TYPE} = RPC_METHODS
function Account({fuzzy, onJumpToSendTx}) {
  const {t} = useTranslation()

  const [accountList, setAccountList] = useState(undefined)

  const {
    data: {
      network: {eid: currentNetworkId},
    },
  } = useCurrentAddress()

  const {data: accountListData} = useAccountList({
    networkId: currentNetworkId,
    fuzzy,
    includeHidden: false,
  })

  useEffect(() => {
    if (!Object.keys(accountListData).length && !fuzzy) {
      setAccountList(undefined)
    } else {
      setAccountList(
        Object.values(accountListData).filter(({account}) => {
          const accounts = Object.values(account)
          const hasCurrent = accounts.find(({selected}) => selected)
          return !hasCurrent || accounts.length > 1
        }),
      )
    }
  }, [accountListData, fuzzy])

  return (
    <div className="h-full overflow-auto">
      {accountList?.length > 0 &&
        accountList.map(
          (
            {nickname: groupNickname, account, vault, eid: accountGroupId},
            index,
          ) => (
            <AccountGroupItem
              key={accountGroupId}
              className={`!mx-0 shadow-fluent-4 ${index !== 0 ? 'mt-4' : ''}`}
              nickname={groupNickname}
              groupType={vault?.type}
              GroupNameOverlay={
                <p className="text-gray-40 text-xs ml-1">{groupNickname}</p>
              }
              groupTag={
                vault?.type === ACCOUNT_GROUP_TYPE.HW && (
                  <LedgerGroupTag
                    networkType={
                      vault?.cfxOnly ? NETWORK_TYPE.CFX : NETWORK_TYPE.ETH
                    }
                  />
                )
              }
            >
              {Object.values(account).map(
                ({
                  nickname: accountNickname,
                  eid: accountId,
                  selected,
                  currentAddress: {value: address},
                }) =>
                  !selected && (
                    <AccountItem
                      key={accountId}
                      className="!p-3 cursor-pointer"
                      accountId={accountId}
                      accountNickname={accountNickname}
                      onClickAccount={() =>
                        onJumpToSendTx({address, note: accountNickname})
                      }
                      AccountNameOverlay={
                        <p className="text-xs text-[#000]">{accountNickname}</p>
                      }
                    />
                  ),
              )}
            </AccountGroupItem>
          ),
        )}
      {accountList?.length === 0 && <NoResult content={t('noResult')} />}
    </div>
  )
}

Account.propTypes = {
  fuzzy: PropTypes.string,
  onJumpToSendTx: PropTypes.func,
}
export default Account
