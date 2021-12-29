import PropTypes from 'prop-types'
import Button from '@fluent-wallet/component-button'
import {request} from '../utils'
import {RPC_METHODS, HW_TX_STATUS} from '../constants'
import {usePendingAuthReq} from '../hooks/useApi'
import useLoading from '../hooks/useLoading'

const {
  WALLET_REJECT_PENDING_AUTH_REQUSET,
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
} = RPC_METHODS
function DappFooter({
  cancelText,
  confirmText,
  confirmDisabled = false,
  confirmParams = {},
  onClickCancel,
  onClickConfirm,
  setSendStatus,
  isHwAccount,
  pendingAuthReq: customPendingAuthReq,
}) {
  let pendingAuthReq = usePendingAuthReq()
  pendingAuthReq = customPendingAuthReq || pendingAuthReq

  const [{req, eid}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const {setLoading} = useLoading()

  const onCancel = () => {
    setLoading(true)
    request(WALLET_REJECT_PENDING_AUTH_REQUSET, {authReqId: eid})
      .then(() => {
        onClickCancel && onClickCancel()
        setLoading(false)
        window.close()
      })
      .catch(e => {
        console.log('error', e)
        // TODO: error message
        setLoading(false)
      })
  }

  const onConfirm = () => {
    if (!req?.method) {
      return
    }
    if (!isHwAccount) setLoading(true)
    else setSendStatus(HW_TX_STATUS.WAITING)
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
    console.log('params', params)

    request(req.method, {authReqId: eid, ...params})
      .then(() => {
        onClickConfirm && onClickConfirm()
        if (!isHwAccount) setLoading(false)
        else setSendStatus(HW_TX_STATUS.SUCCESS)
        window.close()
      })
      .catch(e => {
        // TODO: error message
        console.log('error', e)
        if (!isHwAccount) setLoading(false)
        setSendStatus(HW_TX_STATUS.REJECTED)
      })
  }

  return (
    <footer className="flex w-full px-4">
      <Button
        id="cancelBtn"
        className="flex-1"
        variant="outlined"
        onClick={onCancel}
      >
        {cancelText}
      </Button>
      <div className="w-3" />
      <Button
        id="confirmBtn"
        className="flex-1"
        onClick={onConfirm}
        disabled={confirmDisabled}
      >
        {confirmText}
      </Button>
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
  pendingAuthReq: PropTypes.array,
  isHwAccount: PropTypes.bool,
}

export default DappFooter
