import {useEffect, useState} from 'react'
import {ETH_TX_TYPES} from '@fluent-wallet/consts'
import {useLedgerBindingApi} from '../hooks'
import {useNetworkTypeIsCfx} from './useApi'

export function useLedgerTransaction({enabled, type}) {
  const ledgerBindingApi = useLedgerBindingApi()
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const [status, setStatus] = useState()

  // Legacy fees do not depend on the app version.
  const needsAppVersion =
    enabled && networkTypeIsCfx && type !== ETH_TX_TYPES.LEGACY

  useEffect(() => {
    setStatus(undefined)
    if (!enabled || !ledgerBindingApi) return

    let cancelled = false
    let timer

    const fetchStatus = async () => {
      let nextStatus

      try {
        if (networkTypeIsCfx) {
          nextStatus = await ledgerBindingApi.getAppStatus()
        } else {
          const isAuthed = await ledgerBindingApi.isDeviceAuthed()
          nextStatus = {
            isAuthed,
            isOpen: isAuthed && (await ledgerBindingApi.isAppOpen()),
          }
        }
      } catch (error) {
        nextStatus = {error}
      }

      if (cancelled) return
      setStatus({ledgerBindingApi, ...nextStatus})

      // Retry until the required app is open.
      if (needsAppVersion && !nextStatus.isOpen) {
        timer = setTimeout(fetchStatus, 2000)
      }
    }

    fetchStatus()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [enabled, ledgerBindingApi, networkTypeIsCfx, needsAppVersion])

  // Ignore results from the previous network.
  const currentStatus =
    enabled && status?.ledgerBindingApi === ledgerBindingApi
      ? status
      : undefined

  // Conflux app v1 only supports Legacy transactions.
  const transactionType =
    needsAppVersion && currentStatus?.supports1559 === false
      ? ETH_TX_TYPES.LEGACY
      : type

  return {
    type: transactionType,
    isTypeReady:
      transactionType !== undefined &&
      (!needsAppVersion || currentStatus?.isOpen === true),
    isAuthed: currentStatus?.isAuthed,
    isOpen: currentStatus?.isOpen,
    error: needsAppVersion ? currentStatus?.error : undefined,
  }
}
