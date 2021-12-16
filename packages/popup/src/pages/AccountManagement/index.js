import {useState} from 'react'
import PropTypes from 'prop-types'
import {isNumber, isArray} from '@fluent-wallet/checks'
import {useTranslation} from 'react-i18next'
import useGlobalStore from '../../stores'
import {useHistory} from 'react-router-dom'
import {ROUTES, RPC_METHODS} from '../../constants'
import {request, validatePasswordReg} from '../../utils'
import {Avatar, TitleNav, WrapIcon, ConfirmPassword} from '../../components'
import {useDbAccountListAssets, useCurrentAddress} from '../../hooks/useApi'
import {t} from 'i18next'

const {EXPORT_SEED, EXPORT_PRIVATEKEY} = ROUTES
const {WALLET_EXPORT_ACCOUNT, WALLET_EXPORT_ACCOUNT_GROUP} = RPC_METHODS

function AccountManagementItem({
  nickname,
  account,
  groupType = '',
  onOpenConfirmPassword,
  accountGroupEid,
}) {
  // TODO： should deal with hm type
  return (
    <div className="bg-gray-0 rounded mt-3 mx-3">
      {groupType === 'pk' ? null : (
        <p className="text-gray-40 ml-4 mb-1 text-xs pt-3">{nickname}</p>
      )}
      {account.map(({nickname, eid}, index) => (
        <div
          aria-hidden="true"
          key={index}
          className="flex px-3 py-3.5 rounded hover:bg-primary-4"
        >
          <Avatar
            className="w-5 h-5 mr-2"
            diameter={20}
            accountIdentity={eid}
          />
          <div className="flex-1">{nickname}</div>
          <WrapIcon
            size="w-5 h-5"
            id="open-scan-url"
            onClick={() => {
              onOpenConfirmPassword &&
                onOpenConfirmPassword(WALLET_EXPORT_ACCOUNT, eid)
            }}
          >
            <img className="w-3 h-3" alt="view_pk" src="/images/key.svg" />
          </WrapIcon>
        </div>
      ))}
      {groupType === 'hd' ? (
        <div
          className="mx-3 py-4 text-gray-60 text-xs border-t cursor-pointer"
          onClick={() =>
            onOpenConfirmPassword &&
            onOpenConfirmPassword(WALLET_EXPORT_ACCOUNT_GROUP, accountGroupEid)
          }
          aria-hidden="true"
        >
          {t('viewSeed')}
        </div>
      ) : null}
    </div>
  )
}

AccountManagementItem.propTypes = {
  nickname: PropTypes.string,
  accountGroupEid: PropTypes.number,
  account: PropTypes.array,
  groupType: PropTypes.string,
  onOpenConfirmPassword: PropTypes.func,
}

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

  const {accountGroups} = useDbAccountListAssets()
  const validatePassword = value => {
    // TODO: Replace err msg
    const isValid = validatePasswordReg(value)
    setPasswordErrorMessage(isValid ? '' : 'something wrong')
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
        // TODO: handle error
        setSendingRequestStatus(false)
        setPasswordErrorMessage(e?.message ?? 'something wrong')
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
    <div id="account-management" className="bg-bg pb-8 h-150 w-93 m-auto light">
      <TitleNav title={t('accountManagement')} />
      {Object.values(accountGroups || {}).map(
        ({nickname, account, vault, eid}) => (
          <AccountManagementItem
            key={eid}
            accountGroupEid={eid}
            account={Object.values(account)}
            nickname={nickname}
            groupType={vault?.type}
            onOpenConfirmPassword={onOpenConfirmPassword}
          />
        ),
      )}
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
