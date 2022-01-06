import {useState} from 'react'
import {isNumber, isArray} from '@fluent-wallet/checks'
import {useTranslation} from 'react-i18next'
import useGlobalStore from '../../stores'
import {useHistory} from 'react-router-dom'
import {ROUTES, RPC_METHODS} from '../../constants'
import {request, validatePasswordReg} from '../../utils'
import {TitleNav, ConfirmPassword} from '../../components'
import {useDbAccountListAssets, useCurrentAddress} from '../../hooks/useApi'
import {GroupItem} from './components'
const {EXPORT_SEED, EXPORT_PRIVATEKEY} = ROUTES
const {WALLET_EXPORT_ACCOUNT_GROUP, ACCOUNT_GROUP_TYPE} = RPC_METHODS

function AccountManagement() {
  const {t} = useTranslation()
  const history = useHistory()
  const [openPasswordStatus, setOpenPasswordStatus] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('')
  const [exportMethod, setExportMethod] = useState('')
  const [sendingRequestStatus, setSendingRequestStatus] = useState(false)
  const [dbId, setDbId] = useState('')
  const {setExportPrivateKey, setExportSeedPhrase} = useGlobalStore()

  const {
    data: {
      network: {name: networkName},
    },
  } = useCurrentAddress()

  const {accountGroups} = useDbAccountListAssets({
    type: 'all',
    accountGroupTypes: [ACCOUNT_GROUP_TYPE.HD, ACCOUNT_GROUP_TYPE.PK],
  })
  const validatePassword = value => {
    const isValid = validatePasswordReg(value)
    setPasswordErrorMessage(isValid ? '' : t('passwordRulesWarning'))
    return isValid
  }

  const onConfirmPassword = () => {
    if (
      !validatePassword(password) ||
      !exportMethod ||
      !isNumber(dbId) ||
      sendingRequestStatus
    ) {
      return
    }
    setSendingRequestStatus(true)
    const params =
      exportMethod === WALLET_EXPORT_ACCOUNT_GROUP
        ? {password, accountGroupId: dbId}
        : {password, accountId: dbId}

    request(exportMethod, {...params})
      .then(res => {
        setOpenPasswordStatus(false)
        setSendingRequestStatus(false)
        if (exportMethod === WALLET_EXPORT_ACCOUNT_GROUP) {
          setExportSeedPhrase(res)
          return history.push(EXPORT_SEED)
        }
        setExportPrivateKey(
          isArray(res)
            ? res
                .filter(item => item.network.name === networkName)[0]
                .privateKey.replace('0x', '')
            : res,
        )
        history.push(EXPORT_PRIVATEKEY)
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

  const onCancelPassword = () => {
    setPassword('')
    setOpenPasswordStatus(false)
    setExportMethod('')
    setDbId('')
  }

  const onOpenConfirmPassword = (method, eid) => {
    if (!networkName) {
      return
    }
    setPasswordErrorMessage('')
    setOpenPasswordStatus(true)
    setExportMethod(method)
    setDbId(eid)
  }

  return accountGroups ? (
    <div
      id="account-management"
      className="bg-bg pb-8 h-full w-full flex flex-col"
    >
      <TitleNav title={t('accountManagement')} />
      <div className="flex-1 overflow-y-auto no-scroll">
        {Object.values(accountGroups || {}).map(
          ({nickname, account, vault, eid}) => (
            <GroupItem
              key={eid}
              accountGroupEid={eid}
              account={Object.values(account)}
              nickname={nickname}
              groupType={vault?.type}
              onOpenConfirmPassword={onOpenConfirmPassword}
            />
          ),
        )}
      </div>

      <ConfirmPassword
        open={openPasswordStatus}
        onCancel={onCancelPassword}
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
