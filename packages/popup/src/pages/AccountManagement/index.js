import {useState} from 'react'
import {useSWRConfig} from 'swr'
import {isArray, isUndefined} from '@fluent-wallet/checks'
import {useTranslation} from 'react-i18next'
import useGlobalStore from '../../stores'
import {useHistory} from 'react-router-dom'
import {ROUTES, RPC_METHODS} from '../../constants'
import {TitleNav, ConfirmPassword} from '../../components'
import {useDbAccountListAssets, useCurrentAddress} from '../../hooks/useApi'
import {updateDbAccountList} from '../../utils'
import {GroupItem} from './components'
const {EXPORT_SEED, EXPORT_PRIVATEKEY, SELECT_CREATE_TYPE} = ROUTES
const {WALLET_EXPORT_ACCOUNT_GROUP, WALLET_EXPORT_ACCOUNT, ACCOUNT_GROUP_TYPE} =
  RPC_METHODS

function AccountManagement() {
  const {t} = useTranslation()
  const history = useHistory()
  const {mutate} = useSWRConfig()
  const [openPasswordStatus, setOpenPasswordStatus] = useState(false)
  const [password, setPassword] = useState('')
  const [rpcMethod, setRpcMethod] = useState('')
  const [confirmParams, setConfirmParams] = useState({})
  const {setExportPrivateKey, setExportSeedPhrase} = useGlobalStore()

  const {data} = useCurrentAddress()
  const networkName = data?.network?.name ?? ''
  const currentAccountId = data?.account?.eid
  const currentNetworkId = data?.network?.eid

  const {accountGroups} = useDbAccountListAssets(
    {
      type: 'all',
      accountGroupTypes: [ACCOUNT_GROUP_TYPE.HD, ACCOUNT_GROUP_TYPE.PK],
    },
    'accountManagementQueryAccount',
  )
  const showDelete = !!accountGroups && Object.keys(accountGroups).length > 1

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
      setExportPrivateKey(
        isArray(res)
          ? res
              .filter(item => item.network.name === networkName)[0]
              .privateKey.replace('0x', '')
          : res,
      )
      setOpenPasswordStatus(false)
      history.push(EXPORT_PRIVATEKEY)
      return Promise.resolve()
    }
    // delete account
    return updateDbAccountList(mutate, 'accountManagementQueryAccount', [
      'queryAllAccount',
      currentNetworkId,
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
    if (!networkName) {
      return
    }
    setOpenPasswordStatus(true)
    setRpcMethod(method)
    setConfirmParams({...params})
  }

  return accountGroups && !isUndefined(currentNetworkId) ? (
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
      <div className="flex-1 overflow-y-auto no-scroll mt-1">
        {Object.values(accountGroups || {}).map(
          ({nickname, account, vault, eid}) => (
            <GroupItem
              key={eid}
              accountGroupId={eid}
              account={Object.values(account)}
              nickname={nickname}
              groupType={vault?.type}
              onOpenConfirmPassword={onOpenConfirmPassword}
              showDelete={showDelete}
              currentAccountId={currentAccountId}
              currentNetworkId={currentNetworkId}
            />
          ),
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
