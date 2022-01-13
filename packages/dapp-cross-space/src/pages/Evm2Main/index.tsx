import React, {useState, useCallback, useEffect, useRef, memo} from 'react'
import {a} from '@react-spring/web'
import useClipboard from 'react-use-clipboard'
import {
  useFluent,
  sendTransaction,
  useCrossSpaceContract,
  useEvmMappedAddressBalance,
  trackEvmMappedAddressBalanceChangeOnce,
  useIsSupportEvmSpace,
} from '../../manage'
import {useBalance} from '../../manage/useFluent'
import {
  showWaitFluent,
  showTransactionSubmitted,
  hideWaitFluent,
  hideTransactionSubmitted,
} from '../../components/tools/Modal'
import ShortenAddress from '../../components/ShortenAddress'
import {Unit} from '../../utils'
import showToast, {hideToast} from '../../components/tools/Toast'
import PageTurn from '../../assets/page-turn.svg'
import CFXIcon from '../../assets/cfx.svg'
import Suggest from '../../assets/suggest.svg'
import Copy from '../../assets/copy.svg'
import Success from '../../assets/success.svg'

const Evm2Main: React.FC<{style: any; handleClickFlipped: () => void}> = ({
  style,
  handleClickFlipped,
}) => {
  const {account, evmMappedAddress} = useFluent()
  const [isCopied, setCopied] = useClipboard(evmMappedAddress ?? '', {
    successDuration: 1500,
  })

  const {crossSpaceContract, CrossSpaceContractAdress} = useCrossSpaceContract()
  const [inWithdraw, setInWithdraw] = useState(false)

  const handleWithdraw = useCallback(
    async (withdrawBalance: Unit) => {
      if (!crossSpaceContract || !evmMappedAddress || !CrossSpaceContractAdress) return
      let waitFluentKey: string | number = null!
      let transactionSubmittedKey: string | number = null!

      try {
        waitFluentKey = showWaitFluent()
        const TxnHash = await sendTransaction({
          to: CrossSpaceContractAdress,
          data: crossSpaceContract.withdrawFromMapped(
            withdrawBalance.toHexDrip(),
          ).data,
        })
        setInWithdraw(true)
        transactionSubmittedKey = showTransactionSubmitted(TxnHash)

        trackEvmMappedAddressBalanceChangeOnce(() => {
          setInWithdraw(false)
          hideTransactionSubmitted(transactionSubmittedKey)
          showToast('Withdraw Success!')
        })
      } catch (err) {
        console.error('Withdraw from EVM Space Mapped address error: ', err)
        hideWaitFluent(waitFluentKey)
        if ((err as {code: number})?.code === 4001)
          showToast('You canceled withdraw.')
      }
    },
    [crossSpaceContract, evmMappedAddress],
  )

  return (
    <a.div className="main-content" style={style}>
      <div className="bg-[#F7F8FA] rounded-[8px] p-[16px]">
        <p className="flex items-center">
          <span className="text-[14px] text-[#A9ABB2]">From:</span>
          <span className="ml-[8px] text-[18px] text-[#15C184]">
            Conflux EVM-Chain
          </span>
        </p>
      </div>

      <button
        className="absolute left-[50%] translate-x-[-50%] top-[76px] w-[32px] h-[32px] flex justify-center items-center bg-white rounded-full z-1 hover:scale-110 transition-transform"
        onClick={handleClickFlipped}
      >
        <img
          className="w-[20px] h-[20px]"
          src={PageTurn}
          alt="page-turn button"
          draggable="false"
        />
      </button>

      <div className="mt-[16px] p-[16px] w-[432px] border-[1px] border-[#EAECEF] rounded-[8px]">
        <p className="flex items-center">
          <span className="text-[14px] text-[#A9ABB2]">To:</span>
          <span className="ml-[8px] text-[18px] text-[#2959B4]">
            Conflux Core-Chain
          </span>
        </p>
        <div className="flex items-center mt-[12px] ">
          <ShortenAddress
            className="text-[16px] leading-[22px] text-[#3D3F4C] dfn-center"
            text={account!}
          />
          <span className="inline-block ml-[4px] px-[4px] text-[12px] text-white text-center leading-[18px] bg-[#44D7B6] rounded-[2px]">
            Connected
          </span>
        </div>
        <div className="mt-[16px] p-[12px] flex items-center text-[14px] text-[#3D3F4C] bg-[#F7F8FA] rounded-[2px]">
          <img
            className="mr-[8px] w-[24px] h-[24px]"
            src={CFXIcon}
            alt="cfx icon"
          />
          CFX (Conflux Network)
        </div>
      </div>

      <p className="mt-[24px] flex items-center text-[#3D3F4C] text-[16px] font-medium">
        <span className="inline-block w-[54px] h-[24px] mr-[8px] text-center leading-[24px] bg-[#F0F3FF] rounded-[8px] text-[12px] text-[#808BE7] font-normal">
          Step 1
        </span>
        Transfer Token
      </p>
      <p className="mt-[8px] text-[#A9ABB2] text-[14px]">{`Transfer {CFX} to the following address.`}</p>

      <div className="mt-[12px] pl-[16px] py-[12px] bg-[#F8F9FE]">
        <div className="flex items-center h-[20px] mb-[3px] text-[14px] text-[#3D3F4C] font-semibold">
          <img
            className="w-[16px] h-[16px] mr-[8px]"
            src={Suggest}
            alt="suggest icon"
          />
          Cautious:
        </div>
        <ul className="list-disc pl-[23px] text-[14px] text-[#898D9A] leading-[18px]">
          <li>
            Use <span className="text-[#15C184]">Conflux EVM-Chain</span>.
          </li>
          <li>
            {`Send your {CFX} to the`}{' '}
            <span className="text-[#3D3F4C]">following address</span>.
          </li>
          <li>
            This address can{' '}
            <span className="text-[#3D3F4C]">{`only receive {CFX}.`}</span>
          </li>
        </ul>
      </div>

      <p className="mt-[28px] leading-[22px] font-medium text-[#3D3F4C] text-[16px]">
        Transfer Address
      </p>
      <div
        className="relative w-full mt-[12px] font-medium text-[14px] h-[18px] text-[#15C184] inline-flex items-center cursor-pointer hover:ring-[2px] ring-[#15C184] transition-shadow"
        onClick={setCopied}
      >
        {isCopied && (
          <>
            Copy success!
            <img
              className="ml-1 w-[16px] h-[16px]"
              src={Success}
              alt="success icon"
            />
          </>
        )}
        {!isCopied && (
          <>
            <div className="flex">{evmMappedAddress}</div>
            <img
              className="absolute top-[50%] right-0 translate-y-[-50%] w-[16px] h-[16px]"
              src={Copy}
              alt="copy icon"
            />
          </>
        )}
      </div>

      <div className="mt-[8px] mb-[24px] w-full h-[1px] bg-[#EAECEF]"></div>
      <Withdraw
        account={account}
        handleWithdraw={handleWithdraw}
        inWithdraw={inWithdraw}
      />
    </a.div>
  )
}

const Withdraw: React.FC<{
  account?: string
  inWithdraw: boolean
  handleWithdraw: (amount: Unit) => void
}> = memo(({account, inWithdraw, handleWithdraw}) => {
  const withdrawableBalance = useEvmMappedAddressBalance()
  const preBalance = useRef(withdrawableBalance)
  const {maxAvailableBalance} = useBalance()
  const isSupportEvmSpace = useIsSupportEvmSpace()
  const preAccount = useRef(account)

  useEffect(() => {
    return () => {
      preAccount.current = account
    }
  }, [account])

  useEffect(() => {
    if (preAccount.current !== account) {
      preAccount.current = account
    } else {
      if (
        withdrawableBalance !== undefined &&
        preBalance.current !== undefined &&
        ((preBalance.current.drip <= Unit.fromDecimalCfx('0.000001').drip &&
          withdrawableBalance?.drip > Unit.fromDecimalCfx('0.000001').drip) ||
          withdrawableBalance.drip - preBalance.current.drip >
            Unit.fromDecimalCfx('0.000001').drip)
      )
        showToast('Your EVM Mirror Address receives CFX', {key: 'withdraw'})
    }

    return () => {
      preBalance.current = withdrawableBalance
    }
  }, [withdrawableBalance])

  return (
    <>
      <p className="flex items-center text-[#3D3F4C] text-[16px] font-medium">
        <span className="inline-block w-[54px] h-[24px] mr-[8px] text-center leading-[24px] bg-[#F0F3FF] rounded-[8px] text-[12px] text-[#808BE7] font-normal">
          Step 2
        </span>
        Withdraw
      </p>
      <div className="mt-[8px] mb-[8px] flex items-center h-[22px] text-[14px]">
        <span className="mr-[4px] text-[#A9ABB2]">Current Address: </span>
        <div className="flex items-center">
          <ShortenAddress
            className="text-[#3D3F4C] dfn-center"
            text={account!}
          />
          <span className="inline-block ml-[4px] px-[4px] text-[12px] text-white text-center leading-[18px] bg-[#44D7B6] rounded-[2px]">
            Connected
          </span>
        </div>
      </div>

      <p className="text-[14px]">
        <span className="mr-[4px] text-[#A9ABB2]">Withdrawable: </span>
        <span className="text-[#3D3F4C]">
          {inWithdraw
            ? 'in withdraw...'
            : withdrawableBalance !== undefined
            ? `${withdrawableBalance} CFX`
            : ''}
        </span>
      </p>
      <button
        className="mt-[16px] button w-[134px] h-[40px]"
        disabled={
          inWithdraw ||
          withdrawableBalance === undefined ||
          withdrawableBalance.drip === 0n ||
          !isSupportEvmSpace
        }
        onClick={() => handleWithdraw(withdrawableBalance!)}
      >
        Withdraw
      </button>
    </>
  )
})

export default memo(Evm2Main)
