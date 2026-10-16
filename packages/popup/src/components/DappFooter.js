import PropTypes from 'prop-types'
import {isUndefined} from '@fluent-wallet/checks'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import Message from '@fluent-wallet/component-message'
import {request, setEffectiveCurrentAccount} from '../utils'
import {RPC_METHODS, TX_STATUS} from '../constants'
import {usePendingAuthReq, useCurrentAddress} from '../hooks/useApi'
import useLoading from '../hooks/useLoading'
import {useLedgerBindingApi} from '../hooks'

const {
  WALLET_REJECT_PENDING_AUTH_REQUEST,
  WALLET_REQUEST_PERMISSIONS,
  WALLET_SWITCH_CONFLUX_CHAIN,
  WALLET_SWITCH_ETHEREUM_CHAIN,
  CFX_SIGN_TYPED_DATA_V4,
  ETH_SIGN_TYPED_DATA_V4,
  CFX_SEND_TRANSACTION,
  ETH_SEND_TRANSACTION,
  WALLET_ADD_ETHEREUM_CHAIN,
  WALLET_ADD_CONFLUX_CHAIN,
  WALLET_WATCH_ASSET,
  PERSONAL_SIGN,
  ACCOUNT_GROUP_TYPE,
} = RPC_METHODS
function DappFooter({
  cancelText,
  confirmText,
  confirmDisabled = false,
  showError = true,
  confirmParams = {},
  onClickCancel,
  onClickConfirm,
  setSendStatus,
  setSendError,
  setAuthStatus,
  setIsAppOpen,
  isHwAccount,
  pendingAuthReq: customPendingAuthReq,
  targetNetwork,
  confirmComponent: ConfirmComponent,
}) {
  const {t} = useTranslation()

  const {
    data: {
      account: currentAccount,
      network: {type: currentNetworkType},
    },
  } = useCurrentAddress()
  const ledgerBindingApi = useLedgerBindingApi()
  let pendingAuthReq = usePendingAuthReq()
  pendingAuthReq = customPendingAuthReq || pendingAuthReq

  const [{req, eid}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const {setLoading} = useLoading()

  const onCancel = () => {
    setLoading(true)
    request(WALLET_REJECT_PENDING_AUTH_REQUEST, {authReqId: eid})
      .then(() => {
        onClickCancel && onClickCancel()
        setLoading(false)
        window.close()
      })
      .catch(e => {
        Message.error({
          content: e?.message ?? t('unCaughtErrMsg'),
          top: '10px',
          duration: 1,
        })
        setLoading(false)
      })
  }

  const sendDappRequest = async () => {
    let params = {}
    switch (req.method) {
      case WALLET_REQUEST_PERMISSIONS:
        params.permissions = req.params
        break
      case WALLET_SWITCH_ETHEREUM_CHAIN:
      case WALLET_SWITCH_CONFLUX_CHAIN:
        params.chainConfig = req.params
        break
      case CFX_SEND_TRANSACTION:
      case ETH_SEND_TRANSACTION:
        params.tx = req.params
        break
      case ETH_SIGN_TYPED_DATA_V4:
      case CFX_SIGN_TYPED_DATA_V4:
      case PERSONAL_SIGN:
        params.data = req.params
        break
      case WALLET_ADD_ETHEREUM_CHAIN:
      case WALLET_ADD_CONFLUX_CHAIN:
        params.newChainConfig = req.params
        break
      case WALLET_WATCH_ASSET:
        params.asset = req.params
        break
    }
    params = {...params, ...confirmParams}
    return request(req.method, {authReqId: eid, ...params})
  }

  const onConfirm = async () => {
    try {
      if (isHwAccount) {
        if (!ledgerBindingApi) {
          return
        }
        const authStatus = await ledgerBindingApi.isDeviceAuthed()
        const isAppOpen = await ledgerBindingApi.isAppOpen()
        if (!authStatus) {
          setAuthStatus(authStatus)
          return
        } else if (!isAppOpen) {
          setIsAppOpen(isAppOpen)
          return
        }
      }
      if (!isHwAccount) setLoading(true)
      else setSendStatus?.(TX_STATUS.HW_WAITING)

      if (
        req.method === WALLET_SWITCH_ETHEREUM_CHAIN ||
        req.method === WALLET_SWITCH_CONFLUX_CHAIN
      ) {
        const currentAccountType = currentAccount?.accountGroup?.vault?.type
        if (
          isUndefined(currentAccountType) ||
          isUndefined(targetNetwork?.type)
        ) {
          return
        }

        if (
          currentNetworkType !== targetNetwork.type &&
          currentAccountType === ACCOUNT_GROUP_TYPE.HW
        ) {
          await setEffectiveCurrentAccount(targetNetwork.eid)
        }
      }
      await sendDappRequest()
      onClickConfirm?.()
      if (!isHwAccount) setLoading(false)
      else setSendStatus?.(TX_STATUS.HW_SUCCESS)
      window.close()
    } catch (e) {
      !isHwAccount && setLoading(false)
      setSendStatus?.(TX_STATUS.ERROR)
      setSendError?.(e)
      showError &&
        Message.error({
          content: e?.message ?? t('unCaughtErrMsg'),
          top: '10px',
          duration: 1,
        })
    }
  }

  return (
    <footer className="flex w-full px-3 z-50">
      <Button
        id="cancelBtn"
        className="flex-1"
        variant="outlined"
        onClick={onCancel}
      >
        {cancelText}
      </Button>
      <div className="w-3" />
      {ConfirmComponent ? (
        <ConfirmComponent
          onConfirm={onConfirm}
          confirmDisabled={confirmDisabled}
          disabled={confirmDisabled || !req?.method}
        />
      ) : (
        <Button
          id="confirmBtn"
          className="flex-1"
          onClick={onConfirm}
          disabled={confirmDisabled || !req?.method}
        >
          {confirmText}
        </Button>
      )}
    </footer>
  )
}

DappFooter.propTypes = {
  cancelText: PropTypes.string.isRequired,
  confirmText: PropTypes.string.isRequired,
  confirmParams: PropTypes.object,
  confirmDisabled: PropTypes.bool,
  onClickConfirm: PropTypes.func,
  onClickCancel: PropTypes.func,
  setSendStatus: PropTypes.func,
  setSendError: PropTypes.func,
  setIsAppOpen: PropTypes.func,
  setAuthStatus: PropTypes.func,
  pendingAuthReq: PropTypes.array,
  isHwAccount: PropTypes.bool,
  showError: PropTypes.bool,
  targetNetwork: PropTypes.object,
  confirmComponent: PropTypes.elementType,
}

export default DappFooter
