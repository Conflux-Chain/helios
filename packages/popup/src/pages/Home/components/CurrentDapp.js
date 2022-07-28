import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {AuthorizeModal, DisconnectModal} from '../components'
import {request} from '../../../utils'
import useGlobalStore from '../../../stores/index.js'
import {useCurrentDapp, useCurrentAddress} from '../../../hooks/useApi'
import {useDappIcon} from '../../../hooks'
import {RPC_METHODS} from '../../../constants'
const {WALLET_REQUEST_PERMISSIONS, WALLET_DELETE_APP} = RPC_METHODS

function CurrentDapp() {
  const {t} = useTranslation()
  const {setFatalError} = useGlobalStore()
  const [authModalShow, setAuthModalShow] = useState(false)
  const [disconnectModalShow, setDisconnectModalShow] = useState(false)
  const {data, mutate} = useCurrentDapp()
  const site = data?.site || {}
  const currentDapp = data?.app || {}
  const {currentAccount: dappCurrentAccount, eid: appId} = currentDapp
  const {origin, icon, eid: siteId} = site
  const {nickname: connectedNickname, eid: connectedEid} =
    dappCurrentAccount || {}
  const {
    data: {
      account: {nickname: currentNickname, eid: currentEid},
    },
  } = useCurrentAddress()
  const dappIconUrl = useDappIcon(icon)
  const isConnected = !!data?.app
  const isConnectedCurrentAccount = connectedEid === currentEid
  const connectedAccounts =
    currentDapp?.account?.map(account => account?.eid) || []

  const onAuth = () => {
    request(WALLET_REQUEST_PERMISSIONS, {
      siteId,
      permissions: [{wallet_accounts: {}}],
      accounts: connectedAccounts.concat([currentEid]),
    })
      .then(() => {
        setAuthModalShow(false)
        mutate()
      })
      .catch(error => setFatalError(error))
  }

  const onDisconnect = () => {
    request(WALLET_DELETE_APP, {appId})
      .then(() => setDisconnectModalShow(false))
      .catch(error => setFatalError(error))
  }

  return (
    <div
      className={`current-dapp-container flex items-center ${
        isConnected ? 'h-16' : 'h-10'
      } py-3 rounded-t-xl bg-gray-0 px-3 shrink-0`}
      id="currentDappContainer"
    >
      {!isConnected && (
        <span className="text-gray-40 flex w-full justify-center">
          {t('noConnectedDapp')}
        </span>
      )}
      {isConnected && (
        <>
          <div className="flex items-center justify-center border border-gray-20 w-8 h-8 rounded-full mr-2">
            <img className="w-6 h-6" src={dappIconUrl} alt="logo" />
          </div>
          <div className="flex flex-col flex-1 items-center">
            <div className="flex w-full items-center justify-between mb-0.5">
              <span className="text-gray-80 font-medium inline-block max-w-[180px] text-ellipsis">
                {origin}
              </span>
              <span className="text-gray-60 text-xs inline-block mb-1 max-w-[100px] text-ellipsis">
                {connectedNickname}
              </span>
            </div>
            <div className="flex w-full items-center justify-between">
              <span
                id="setDisconnectModalShowBtn"
                className="h-5 px-2 bg-primary-10 hover:bg-primary-10 rounded-full text-success text-xs flex items-center justify-center cursor-pointer"
                aria-hidden="true"
                onClick={() => setDisconnectModalShow(true)}
              >
                <span className="w-1 h-1 rounded-full bg-success border border-gray-0 box-content mr-1" />
                {t('connected')}
              </span>
              {!isConnectedCurrentAccount ? (
                <span
                  id="setAuthModalShowBtn"
                  className="text-primary text-xs cursor-pointer inline-block max-w-[140px] text-ellipsis hover:text-primary-dark"
                  onClick={() => setAuthModalShow(true)}
                  aria-hidden="true"
                >
                  {t('authorizeCurrentAccount', {
                    currentAccount: currentNickname,
                  })}
                </span>
              ) : (
                <span />
              )}
            </div>
            <AuthorizeModal
              open={authModalShow}
              onClose={() => setAuthModalShow(false)}
              needAuthAccountName={currentNickname}
              onAuth={onAuth}
            />
            <DisconnectModal
              open={disconnectModalShow}
              onClose={() => setDisconnectModalShow(false)}
              onDisconnect={onDisconnect}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default CurrentDapp
