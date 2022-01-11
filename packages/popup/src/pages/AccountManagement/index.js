import {useState} from 'react'
import {useSWRConfig} from 'swr'
import {isArray} from '@fluent-wallet/checks'
import {useTranslation} from 'react-i18next'
import useGlobalStore from '../../stores'
import {useHistory} from 'react-router-dom'
import {ROUTES, RPC_METHODS} from '../../constants'
import {request, validatePasswordReg} from '../../utils'
import {TitleNav, ConfirmPassword} from '../../components'
import {useDbAccountListAssets, useCurrentAddress} from '../../hooks/useApi'
import {GroupItem} from './components'
const {EXPORT_SEED, EXPORT_PRIVATEKEY, SELECT_CREATE_TYPE} = ROUTES
const {
  WALLET_EXPORT_ACCOUNT_GROUP,
  WALLET_EXPORT_ACCOUNT,
  ACCOUNT_GROUP_TYPE,
  WALLETDB_ACCOUNT_LIST_ASSETS,
} = RPC_METHODS

function AccountManagement() {
  const {t} = useTranslation()
  const history = useHistory()
  const {mutate} = useSWRConfig()
  const [openPasswordStatus, setOpenPasswordStatus] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('')
  const [rpcMethod, setRpcMethod] = useState('')
  const [sendingRequestStatus, setSendingRequestStatus] = useState(false)
  const [confirmParams, setConfirmParams] = useState({})
  const {setExportPrivateKey, setExportSeedPhrase} = useGlobalStore()

  const {data} = useCurrentAddress()
  const networkName = data?.network?.name ?? ''
  const currentAccountId = data?.account?.eid

  const {accountGroups} = useDbAccountListAssets({
    type: 'all',
    accountGroupTypes: [ACCOUNT_GROUP_TYPE.HD, ACCOUNT_GROUP_TYPE.PK],
  })
  const showDelete = !!accountGroups && Object.keys(accountGroups).length > 1
  const validatePassword = value => {
    const isValid = validatePasswordReg(value)
    setPasswordErrorMessage(isValid ? '' : t('passwordRulesWarning'))
    return isValid
  }

  const onConfirmPassword = () => {
    if (
      !validatePassword(password) ||
      !rpcMethod ||
      !Object.keys(confirmParams).length ||
      sendingRequestStatus
    ) {
      return
    }
    setSendingRequestStatus(true)
    request(rpcMethod, {...confirmParams, password})
      .then(res => {
        // export account group
        if (rpcMethod === WALLET_EXPORT_ACCOUNT_GROUP) {
          setExportSeedPhrase(res)
          setOpenPasswordStatus(false)
          setSendingRequestStatus(false)
          return history.push(EXPORT_SEED)
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
          setSendingRequestStatus(false)
          return history.push(EXPORT_PRIVATEKEY)
        }
        // delete account
        mutate([
          WALLETDB_ACCOUNT_LIST_ASSETS,
          ACCOUNT_GROUP_TYPE.HD,
          ACCOUNT_GROUP_TYPE.PK,
        ]).then(() => {
          clearPasswordInfo()
          setSendingRequestStatus(false)
        })
      })
      .catch(e => {
        setSendingRequestStatus(false)
        setPasswordErrorMessage(
          e?.message?.indexOf?.('Invalid password') !== -1
            ? t('invalidPassword')
            : e?.message ?? t('invalidPasswordFromRpc'),
        )
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
    setPasswordErrorMessage('')
    setOpenPasswordStatus(true)
    setRpcMethod(method)
    setConfirmParams({...params})
  }

  return accountGroups ? (
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
            />
          ),
        )}
      </div>

      <ConfirmPassword
        open={openPasswordStatus}
        onCancel={clearPasswordInfo}
        onConfirm={onConfirmPassword}
        password={password}
        passwordErrorMessage={passwordErrorMessage}
        setPassword={setPassword}
        validatePassword={validatePassword}
      />
    </div>
  ) : null
}

export default AccountManagement
