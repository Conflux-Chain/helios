import React, {useState, useEffect, useCallback} from 'react'
import {useFluent, connect, addEVMChain} from '../../manage/useFluent'
import showToast from '../../components/tools/Toast'
import ShortenAddress from '../../components/ShortenAddress'
import ConfluxIcon from '../../assets/icon.svg'
import FluentIcon from '../../assets/fluent.svg'
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
    <nav className="h-[64PX]">
      <div className="container h-full m-auto flex justify-between items-center whitespace-nowrap">
        <div className="flex items-center">
          <img
            className="mr-[4px] w-[24px] h-[24px]"
            src={ConfluxIcon}
            alt="conflux icon"
          />
          <h4 className="text-[16px] leading-[22px] font-medium">
            Conflux Network
          </h4>
        </div>

        <div className="flex items-center justify-center">
          {isConnected && !addedEvmChain && (
            <button
              className="button text-[14px] h-[40px]"
              onClick={handleClickAddEVMChain}
            >
              Add EVM-Chain
            </button>
          )}
          {!isConnected && (
            <button
              className="button text-[14px] h-[40px]"
              disabled={!!account}
              onClick={handleClickConnect}
            >
              <img
                className="mr-[4px] w-[16px] h-[16px]"
                src={FluentIcon}
                alt="fluent icon"
              />
              Connect Fluent
            </button>
          )}
          {isConnected && account && (
            <div className="flex justify-end items-center ml-[12px] pr-[4px] text-[14px] bg-white w-[252px] h-[40px] rounded-[54px] text-[#3D3F4C]">
              <span className="nav-spin mr-[4px]" />
              Core-Chain
              <ShortenAddress
                className="h-[32px] px-[8px] ml-[8px] text-[#808BE7] bg-[#F8F9FE] rounded-[54px] dfn-right"
                text={account}
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Nav
