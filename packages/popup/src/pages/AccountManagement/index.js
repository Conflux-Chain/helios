import {useState} from 'react'
import {isString, isArray, isUndefined} from '@fluent-wallet/checks'
import {useTranslation} from 'react-i18next'
import Message from '@fluent-wallet/component-message'
import {useHistory} from 'react-router-dom'
import {DEFAULT_CFX_HDPATH, DEFAULT_ETH_HDPATH} from '@fluent-wallet/consts'
import useGlobalStore from '../../stores'
import {ROUTES, RPC_METHODS, NETWORK_TYPE} from '../../constants'
import {
  TitleNav,
  ConfirmPassword,
  SearchAccount,
  NoResult,
  AccountGroupItem,
  AccountItem,
  LedgerGroupTag,
} from '../../components'
import {useAccountList, useCurrentAddress} from '../../hooks/useApi'
import {request, getAvatarAddress} from '../../utils'
import {TextNickname, GroupFooter, AccountOperation} from './components'
const {EXPORT_SEED, EXPORT_PRIVATEKEY, SELECT_CREATE_TYPE} = ROUTES
const {WALLET_EXPORT_ACCOUNT_GROUP, WALLET_EXPORT_ACCOUNT, ACCOUNT_GROUP_TYPE} =
  RPC_METHODS

const PKDATAINFO = {
  [DEFAULT_CFX_HDPATH]: {
    des: 'confluxPathStandard',
    subDes: 'confluxPathStandardDes',
    index: 0,
  },
  [DEFAULT_ETH_HDPATH]: {
    des: 'ethereumPathStandard',
    subDes: 'ethereumPathStandardDes',
    index: 1,
  },
}

const getPrivateKey = res => {
  let ret = []
  if (isArray(res)) {
    let pkObj = {}
    for (let i in res) {
      const hdPath = res[i]?.network?.hdPath?.value
      if (PKDATAINFO?.[hdPath] && !pkObj?.[hdPath]) {
        const pk = res[i]?.privateKey?.replace?.('0x', '')

        pkObj[hdPath] = {
          pk,
          ...PKDATAINFO[hdPath],
        }
      }

      if (Object.keys(pkObj).length === 2) {
        break
      }
    }
    ret = Object.values(pkObj).length
      ? Object.values(pkObj).sort((a, b) => a.index - b.index)
      : []
  } else if (isString(res)) {
    ret = [{pk: res}]
  }
  return ret
}

function AccountManagement() {
  const {t} = useTranslation()
  const history = useHistory()
  const [openPasswordStatus, setOpenPasswordStatus] = useState(false)
  const [password, setPassword] = useState('')
  const [rpcMethod, setRpcMethod] = useState('')
  const [confirmParams, setConfirmParams] = useState({})
  const {setExportPrivateKeyData, setExportSeedPhrase} = useGlobalStore()
  const [searchContent, setSearchContent] = useState('')
  const [searchedAccountGroup, setSearchedAccountGroup] = useState(null)
  // to refresh searched data
  const [refreshDataStatus, setRefreshDataStatus] = useState(false)

  const {data, mutate: mutateCurrentAddress} = useCurrentAddress()
  const currentNetworkId = data?.network?.eid

  const {data: allAccountGroups, mutate: mutateAllAccountGroups} =
    useAccountList({
      getAllNetworkAccount: true,
      includeHidden: true,
    })

  const {data: pkHdAccountGroups, mutate: mutatePkHdAccountGroups} =
    useAccountList({
      networkId: currentNetworkId,
      groupTypes: [ACCOUNT_GROUP_TYPE.HD, ACCOUNT_GROUP_TYPE.PK],
      includeHidden: true,
    })

  const accountGroupData = searchedAccountGroup
    ? Object.values(searchedAccountGroup)
    : Object.values(allAccountGroups)

  const showDelete = Object.keys(pkHdAccountGroups).length > 1

  const onConfirmCallback = res => {
    // export account group
    if (rpcMethod === WALLET_EXPORT_ACCOUNT_GROUP) {
      setExportSeedPhrase(res)
      setOpenPasswordStatus(false)
      history.push(EXPORT_SEED)
      return Promise.resolve()
    }
    // export account (include pk account group)
    if (rpcMethod === WALLET_EXPORT_ACCOUNT) {
      setExportPrivateKeyData(getPrivateKey(res))
      setOpenPasswordStatus(false)
      history.push(EXPORT_PRIVATEKEY)
      return Promise.resolve()
    }
    // delete account or account group
    setRefreshDataStatus(!refreshDataStatus)
    return Promise.all([
      mutateCurrentAddress?.(),
      mutateAllAccountGroups?.(),
      mutatePkHdAccountGroups?.(),
    ]).then(() => {
      clearPasswordInfo()
    })
  }

  const clearPasswordInfo = () => {
    setPassword('')
    setOpenPasswordStatus(false)
    setRpcMethod('')
    setConfirmParams({})
  }

  const onOpenConfirmPassword = (method, params) => {
    if (isUndefined(currentNetworkId)) {
      return
    }
    setOpenPasswordStatus(true)
    setRpcMethod(method)
    setConfirmParams({...params})
  }
  // update data when edit account / group name
  const updateEditedName = (params, rpcMethod) => {
    return new Promise((resolve, reject) => {
      request(rpcMethod, params)
        .then(() => {
          setRefreshDataStatus(!refreshDataStatus)
          Promise.all([mutateCurrentAddress(), mutateAllAccountGroups()]).then(
            resolve,
          )
        })
        .catch(e => {
          Message.error({
            content:
              e?.message?.split?.('\n')?.[0] ??
              e?.message ??
              t('unCaughtErrMsg'),
            top: '10px',
            duration: 1,
          })
          reject()
        })
    })
  }

  return Object.values(allAccountGroups).length ? (
    <div
      id="account-management"
      className="bg-bg pb-8 h-full w-full flex flex-col"
    >
      <TitleNav
        title={t('accountManagement')}
        rightButton={
          <span
            id="add-account"
            aria-hidden
            className="text-primary text-sm  mr-1 hover:text-[#5D5FEF]"
            onClick={() => history.push(SELECT_CREATE_TYPE)}
          >
            {t('add')}
          </span>
        }
      />
      <div className="px-3 mt-1">
        <SearchAccount
          currentNetworkId={currentNetworkId}
          onSearch={setSearchContent}
          searchContent={searchContent}
          onSearchCallback={setSearchedAccountGroup}
          refreshDataStatus={refreshDataStatus}
          showHiddenAccount={true}
        />
      </div>
      <div className="flex-1 overflow-y-auto no-scroll mt-0">
        {searchedAccountGroup && accountGroupData.length === 0 ? (
          <NoResult content={t('noResult')} imgClassName="mt-[116px]" />
        ) : (
          accountGroupData.map(
            ({
              nickname: groupNickname,
              account,
              vault,
              eid: accountGroupId,
            }) => (
              <AccountGroupItem
                key={accountGroupId}
                nickname={groupNickname}
                groupType={vault?.type}
                GroupNameOverlay={
                  <TextNickname
                    id={accountGroupId}
                    nickname={groupNickname}
                    accountGroupId={accountGroupId}
                    updateEditedName={updateEditedName}
                  />
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
                groupFooter={
                  vault?.type === ACCOUNT_GROUP_TYPE.HD && (
                    <GroupFooter
                      onOpenConfirmPassword={onOpenConfirmPassword}
                      accountGroupId={accountGroupId}
                      showDelete={showDelete}
                      accounts={Object.values(account)}
                    />
                  )
                }
              >
                {Object.values(account).map(
                  ({
                    nickname: accountNickname,
                    eid: accountId,
                    hidden,
                    selected,
                    address,
                  }) => (
                    <AccountItem
                      showAvatar={false}
                      key={accountId}
                      accountId={accountId}
                      accountNickname={accountNickname}
                      address={getAvatarAddress(address)}
                      className="pl-4"
                      AccountNameOverlay={
                        <TextNickname
                          nickname={accountNickname}
                          accountId={accountId}
                          updateEditedName={updateEditedName}
                        />
                      }
                      rightComponent={
                        <AccountOperation
                          groupType={vault?.type}
                          accountId={accountId}
                          accountGroupId={accountGroupId}
                          hidden={hidden}
                          selected={selected}
                          showDelete={showDelete}
                          accounts={Object.values(
                            pkHdAccountGroups?.[accountGroupId]?.account || {},
                          )}
                          onOpenConfirmPassword={onOpenConfirmPassword}
                          updateEditedName={updateEditedName}
                        />
                      }
                    />
                  ),
                )}
              </AccountGroupItem>
            ),
          )
        )}
      </div>

      <ConfirmPassword
        open={openPasswordStatus}
        onCancel={clearPasswordInfo}
        password={password}
        setPassword={setPassword}
        rpcMethod={rpcMethod}
        confirmParams={confirmParams}
        onConfirmCallback={onConfirmCallback}
      />
    </div>
  ) : null
}

export default AccountManagement
