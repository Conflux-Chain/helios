import {useEffect, useState} from 'react'
import {Conflux} from '@fluent-wallet/ledger'

import {LEDGER_AUTH_STATUS} from '../constants'

export const useConnect = () => {
  const [authStatus, setAuthStatus] = useState(LEDGER_AUTH_STATUS.LOADING)
  const [isAppOpen, setIsAppOpen] = useState(false)
  const cfx = new Conflux()

  useEffect(() => {
    const fetchStatus = async () => {
      const isAuthed = await cfx.isDeviceAuthed()
      setAuthStatus(
        isAuthed ? LEDGER_AUTH_STATUS.AUTHED : LEDGER_AUTH_STATUS.UNAUTHED,
      )
      const isOpen = await cfx.isAppOpen()
      setIsAppOpen(isOpen)
    }
    fetchStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return {authStatus, isAppOpen}
}
