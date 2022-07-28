import {useEffect, useState} from 'react'
import {useLedgerBindingApi} from '../hooks'
import {LEDGER_AUTH_STATUS, LEDGER_OPEN_STATUS} from '../constants'

export const useConnect = () => {
  const [authStatus, setAuthStatus] = useState(LEDGER_AUTH_STATUS.LOADING)
  const [isAppOpen, setIsAppOpen] = useState(LEDGER_OPEN_STATUS.LOADING)
  const ledgerBindingApi = useLedgerBindingApi()

  useEffect(() => {
    if (ledgerBindingApi) {
      const fetchStatus = async () => {
        try {
          const isAuthed = await ledgerBindingApi.isDeviceAuthed()
          setAuthStatus(
            isAuthed ? LEDGER_AUTH_STATUS.AUTHED : LEDGER_AUTH_STATUS.UNAUTHED,
          )
          const isOpen = await ledgerBindingApi.isAppOpen()
          setIsAppOpen(
            isOpen ? LEDGER_OPEN_STATUS.OPEN : LEDGER_OPEN_STATUS.UNOPEN,
          )
        } catch (err) {
          // handle error in browsers without navigator.usb
          if (!err?.message?.includes('navigator.usb is undefined')) throw err
        }
      }
      fetchStatus()
    }
  }, [ledgerBindingApi])
  return {authStatus, isAppOpen}
}
