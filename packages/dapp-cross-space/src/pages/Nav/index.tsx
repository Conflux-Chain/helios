import React, {useState, useEffect, useCallback} from 'react'
import {useFluent, connect, addEVMChain} from '../../manage/useFluent'
import {addEVMChainToMetaMask} from '../../manage/useEvm'
import showToast, {hideToast} from '../../components/tools/Toast'
import ShortenAddress from '../../components/ShortenAddress'
import ConfluxIcon from '../../assets/icon.svg'
import FluentIcon from '../../assets/fluent.svg'
import './index.css'

const Nav: React.FC = () => {
  const {account, isConnected, chainId} = useFluent()
  const [showAddedEvmChainToFluent, setShowAddedEvmChainToFluent] = useState(false)
  const [showAddedEvmChainToMetaMask, setShowAddedEvmChainToMetaMask] = useState(false)

  // delete this after testnet ready
  const checkNetwork = useCallback(async () => {
    try {
      await window.conflux!.request({
        method: 'wallet_switchConfluxChain',
        params: [{chainId: '0x2ee0'}],
      })
    } catch (err) {
        if (!((err as {code: number})?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1)) {
          showToast("You haven't add EVM-Chain in fluent, Please click the top button to add.", {key: 'switch-fluent'});
          setShowAddedEvmChainToFluent(true);
        }
    }

    try {
      if (!window.ethereum) {
        showToast("You don't have MetaMask installed", {key: 'not-installed-metamask'})
        return;
      }
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{chainId: '0x2ee1'}],
      })
    } catch (err) {
        if (!((err as {code: number})?.code === 4001 && (err as any)?.message === 'User rejected the request.')) {
          showToast("You haven't add EVM-Chain in MetaMask, Please click the top button to add.", {key: 'switch-metamask'});
          setShowAddedEvmChainToMetaMask(true);
        }
    }
  }, []);

  useEffect(() => {
    if (!isConnected) {
      setShowAddedEvmChainToMetaMask(false)
      setShowAddedEvmChainToFluent(false)
    } else {
      checkNetwork();
    }
  }, [isConnected])

  const handleClickAddEVMChainToFluent = useCallback(async () => {
    try {
      await addEVMChain()
      hideToast('switch-fluent')
      showToast('Added EVM-Chain to Fluent Success!')
      setShowAddedEvmChainToFluent(false)
      await window.conflux!.request({
        method: 'wallet_switchConfluxChain',
        params: [{chainId: '0x2ee0'}],
      })
    } catch (err) {
      console.error(err)
    }
  }, [])

  const handleClickAddEVMChainToMetaMask = useCallback(async () => {
    if (!window.ethereum) {
      showToast("You don't have MetaMask installed", {key: 'not-installed-metamask'})
      return;
    }
    try {
      await addEVMChainToMetaMask()
      hideToast('switch-metamask')
      showToast('Added EVM-Chain to MetaMask Success!')
      setShowAddedEvmChainToMetaMask(false)
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{chainId: '0x2ee1'}],
      })
    } catch (err) {
      console.error(err)
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
        showToast("You don't have Fluent installed", {key: 'not-installed'})
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
            <span className='beta ml-[8px] inline-block w-[35px] h-[18px] leading-[18px] rounded-[2px] text-center text-[12px] text-[#7B492D] translate-y-[-2px]'>Beta</span>
          </h4>
        </div>

        <div className="flex items-center justify-center">
          {isConnected && showAddedEvmChainToMetaMask && (
            <button
              className="button text-[14px] h-[40px]"
              onClick={handleClickAddEVMChainToMetaMask}
            >
              Add EVM-Chain To MetaMask
            </button>
          )}
          {isConnected && showAddedEvmChainToFluent && chainId !== '12000' && (
            <button
              className="button text-[14px] h-[40px] ml-[12px]"
              onClick={handleClickAddEVMChainToFluent}
            >
              Add EVM-Chain To Fluent
            </button>
          )}
          {!isConnected && (
            <button
              id="btn-connect-nav"
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
            <div className="flex justify-end items-center ml-[12px] pr-[4px] text-[14px] bg-white w-[256px] h-[40px] rounded-[54px] text-[#3D3F4C]">
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
