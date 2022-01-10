import React, {useState, useEffect, useCallback} from 'react'
import {useFluent, connect, addEVMChain} from '../../manage/useFluent'
import showToast from '../../components/tools/Toast'
import './index.css'

const Nav: React.FC = () => {
  const {account, isConnected} = useFluent()
  const [addedEvmChain, setAddedEvmChain] = useState(false)

  useEffect(() => {
    if (!isConnected) setAddedEvmChain(false)
  }, [isConnected])

  const handleClickAddEVMChain = useCallback(async () => {
    try {
      await addEVMChain()
      showToast('Added EVM-Chain Success!')
      setAddedEvmChain(true)
    } catch (err) {
      console.error(err)
      if ((err as any)?.code === -32602) {
        showToast('You have added EVM-Chain', {key: 'have-added'})
        setAddedEvmChain(true)
      }
    }
  }, [])

  const handleClickConnect = useCallback(async () => {
    try {
      await connect()
      showToast('Connect to Fluent Success!')
    } catch (err) {
      console.error(err)
      if ((err as any)?.code === -32000) {
        showToast('You have opened the connection window', {key: 'have-opened'})
      }
      if ((err as any)?.message === 'not installed') {
        showToast("You doesn't have Fluent installed", {key: 'not-installed'})
      }
    }
  }, [])

  return (
    <nav className="h-14 bg-gray-200 ">
      <div className="container h-full m-auto flex justify-between items-center whitespace-nowrap">
        <h2 className="text-lg font-semibold">Conflux Network</h2>

        <div className="whitespace-nowrap">
          {isConnected && !addedEvmChain && (
            <button className="nav-btn" onClick={handleClickAddEVMChain}>
              Add EVM-Chain
            </button>
          )}
          <button
            className="nav-btn ml-4"
            disabled={!!account}
            onClick={handleClickConnect}
          >
            <span className="block max-w-[230px] overflow-hidden text-ellipsis">
              {isConnected ? `Core-Chain: ${account}` : 'Connect Fluent'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Nav
