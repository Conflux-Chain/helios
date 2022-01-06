import {useState} from 'react'
import {useEffectOnce} from 'react-use'

import {Conflux} from '@fluent-wallet/ledger'

import {LEDGER_AUTH_STATUS, LEDGER_OPEN_STATUS} from '../constants'

export const useConnect = () => {
  const [authStatus, setAuthStatus] = useState(LEDGER_AUTH_STATUS.LOADING)
  const [isAppOpen, setIsAppOpen] = useState(LEDGER_OPEN_STATUS.LOADING)
  const cfx = new Conflux()

  useEffectOnce(() => {
    const fetchStatus = async () => {
      const isAuthed = await cfx.isDeviceAuthed()
      setAuthStatus(
        isAuthed ? LEDGER_AUTH_STATUS.AUTHED : LEDGER_AUTH_STATUS.UNAUTHED,
      )
      const isOpen = await cfx.isAppOpen()
      setIsAppOpen(isOpen ? LEDGER_OPEN_STATUS.OPEN : LEDGER_OPEN_STATUS.UNOPEN)
    }
    fetchStatus()
  })
  return {authStatus, isAppOpen}
}
