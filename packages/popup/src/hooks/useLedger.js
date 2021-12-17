import {useEffect, useState} from 'react'
import {Conflux} from '@fluent-wallet/ledger'

export const useConnect = () => {
  const [isAuthed, setIsAuthed] = useState(false)
  const [isAppOpen, setIsAppOpen] = useState(false)
  const cfx = new Conflux()

  useEffect(() => {
    const fetchStatus = async () => {
      setIsAuthed(await cfx.isDeviceAuthed())
      setIsAppOpen(await cfx.isAppOpen())
    }
    fetchStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return {isAuthed, isAppOpen}
}
