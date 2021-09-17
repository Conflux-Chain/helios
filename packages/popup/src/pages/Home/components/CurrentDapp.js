import {useRPC} from '@fluent-wallet/use-rpc'
import {useTranslation} from 'react-i18next'
import {RPC_METHODS} from '../../../constants'
const {GET_CURRENT_DAPP, GET_CURRENT_ACCOUNT} = RPC_METHODS

function CurrentDapp() {
  const {t} = useTranslation()
  const {data: currentDapp} = useRPC([GET_CURRENT_DAPP], undefined, {
    fallbackData: {},
  })
  const {data: currentAccount} = useRPC([GET_CURRENT_ACCOUNT], undefined, {
    fallbackData: {},
  })
  const {
    url = 'https://shuttleflow.io',
    icon,
    connectedAccount = {},
  } = currentDapp || {}
  const {nickname: connectedNickname = 'Account 1', eid: connectedEid} =
    connectedAccount
  const {nickname: currentNickname, eid: currentEid} = currentAccount
  const isConnected = !!connectedAccount
  const isConnectedCurrentAccount = connectedEid === currentEid

  return (
    <div className="flex items-center h-16 rounded-t-xl bg-gray-0 px-3">
      {!isConnected && (
        <span className="text-gray-40">{t('noConnectedDapp')}</span>
      )}
      {isConnected && (
        <>
          <div className="flex items-center justify-center border border-gray-20 rounded-full mr-2">
            <img className="w-8 h-8" src={icon} alt="logo" />
          </div>
          <div className="flex flex-col flex-1 items-center">
            <div className="flex w-full items-center justify-between mb-0.5">
              <span className="text-gray-80 font-medium inline-block">
                {url}
              </span>
              <span className="text-gray-60 text-xs inline-block mb-1">
                {connectedNickname}
              </span>
            </div>
            <div className="flex w-full items-center justify-between">
              <span className="h-5 px-2 bg-primary-4 rounded-full text-success text-xs flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-success border border-gray-0 box-content mr-1" />
                {t('connected')}
              </span>
              {!isConnectedCurrentAccount ? (
                <span className="text-primary text-xs">
                  {t('authorizeCurrentAccount', {
                    currentAccount: currentNickname,
                  })}
                </span>
              ) : (
                <span />
              )}
            </div>
          </div>
          <div className="flex items-center justify-end flex-col"></div>
        </>
      )}
    </div>
  )
}

export default CurrentDapp
