import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'

import {useAccountList, useCurrentAddress} from '../../../hooks/useApi'
import {NoResult, GroupItem, AccountItem} from '../../../components'

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
    <div className=" h-full">
      {accountList?.length > 0 &&
        accountList.map(
          (
            {nickname: groupNickname, account, vault, eid: accountGroupId},
            index,
          ) => (
            <GroupItem
              key={accountGroupId}
              className={`!mx-0 ${index !== 0 ? 'mt-4' : ''}`}
              groupContainerClassName="!mb-0"
              nickname={groupNickname}
              groupType={vault?.type}
            >
              {Object.values(account).map(
                ({nickname: accountNickname, eid: accountId, selected}) =>
                  !selected && (
                    <AccountItem
                      key={accountId}
                      className="!p-3  cursor-pointer"
                      accountId={accountId}
                      accountNickname={accountNickname}
                      onClickAccount={onJumpToSendTx}
                    />
                  ),
              )}
            </GroupItem>
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
