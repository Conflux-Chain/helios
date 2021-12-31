import {RPC_METHODS} from '../../constants'
import {request} from '../../utils'
import {usePendingAuthReq, useAllGroup} from '../../hooks/useApi'

const {WALLET_REJECT_PENDING_AUTH_REQUSET} = RPC_METHODS

export default function PendingAuthReqExample() {
  const pendingAuthReq = usePendingAuthReq()
  const groups = useAllGroup()
  console.log('groups = ', groups)
  if (!(pendingAuthReq?.length > 0)) return <div></div>
  console.log('pendingAuthReq = ', JSON.stringify(pendingAuthReq))
  const [
    {
      req, // app, site,
      eid,
    },
  ] = pendingAuthReq
  console.log('req = ', req)
  const cancel = () =>
    request(WALLET_REJECT_PENDING_AUTH_REQUSET, {authReqId: eid}).then(
      window.location.reload,
    )

  const confirm = () => {
    const confirmReq = {authReqId: eid}
    if (req.method === 'wallet_requestPermissions') {
      confirmReq.permissions = req.params
      confirmReq.accounts = [groups[0].account[0].eid]
    } else if (req.method === 'personal_sign') {
      confirmReq.data = req.params
    } else if (req.method === 'cfx_signTypedData_v4') {
      confirmReq.data = req.params
    } else if (req.method === 'wallet_switchConfluxChain') {
      confirmReq.chainConfig = req.params
    } else if (req.method === 'wallet_addEthereumChain') {
      confirmReq.newChainConfig = req.params
    } else if (req.method === 'wallet_watchAsset') {
      confirmReq.asset = req.params
    }

    request(req.method, confirmReq)
      .then(res => {
        console.log('confirm res', res)
        window.location.reload()
      })
      .catch(console.error)
  }

  return (
    <div>
      auth req id: {eid}
      <br />
      method: {req.method}
      <br />
      params: {JSON.stringify(req.params, null, 4)}
      <br />
      <br />
      <button onClick={cancel}>BUTTON:Cancel/Reject/...</button>
      <br />
      <button onClick={confirm}>BUTTON:Confirm/Approve...</button>
    </div>
  )
}
