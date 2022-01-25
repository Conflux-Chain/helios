import React, {useCallback, memo, useEffect} from 'react'
import {a} from '@react-spring/web'
import {useForm, type UseFormRegister, type FieldValues} from 'react-hook-form'
import classNames from 'clsx'
import ShortenAddress from '../../components/ShortenAddress'
import {
  useFluent,
  useBalance,
  sendTransaction,
  trackBalanceChangeOnce,
} from '../../manage/useFluent'
import {
  useCrossSpaceContract,
} from '../../manage/useConflux'
import {useIsSupportEvmSpace} from '../../manage/useEvm'
import {Unit} from '../../utils'
import {
  showWaitFluent,
  showTransactionSubmitted,
  hideWaitFluent,
  hideTransactionSubmitted,
} from '../../components/tools/Modal'
import showToast from '../../components/tools/Toast'
import CFXIcon from '../../assets/cfx.svg'
import PageTurn from '../../assets/page-turn.svg'
import './index.css';

const Main2Evm: React.FC<{style: any; handleClickFlipped: () => void}> = ({
  style,
  handleClickFlipped,
}) => {
  const {register, handleSubmit, setValue} = useForm()
  const {account} = useFluent()
  const {crossSpaceContract, CrossSpaceContractAdress} = useCrossSpaceContract()

  const setAmount = useCallback((val: string) => {
    const _val = val.replace(/(?:\.0*|(\.\d+?)0+)$/, '$1')
    setValue('amount', _val)
    const receivedCFX = document.querySelector('#receivedCFX')
    if (receivedCFX)
      receivedCFX.textContent = _val ? `${_val} CFX` : ''
  }, [])

  useEffect(() => setAmount(''), [account])

  const onSubmit = useCallback(
    handleSubmit(
      async ({evmAddress, amount}: {evmAddress: string; amount: string}) => {
        if (!crossSpaceContract || !CrossSpaceContractAdress) return
        let waitFluentKey: string | number = null!
        let transactionSubmittedKey: string | number = null!
        try {
          waitFluentKey = showWaitFluent()
          const TxnHash = await sendTransaction({
            to: CrossSpaceContractAdress,
            data: crossSpaceContract.transferEVM(evmAddress).data,
            value: Unit.fromDecimalCfx(amount).toHexDrip(),
          })
          transactionSubmittedKey = showTransactionSubmitted(TxnHash)
          trackBalanceChangeOnce(() => {
            hideTransactionSubmitted(transactionSubmittedKey)
            showToast('It seems transfer CFX to EVM Space success.')
          })
        } catch (err) {
          console.error('SendTransaction to EVM Space error: ', err)
          hideWaitFluent(waitFluentKey)
          if ((err as {code: number})?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1)
            showToast('You canceled the transaction.')
        } finally {
          setAmount('')
        }
      },
    ),
    [crossSpaceContract, CrossSpaceContractAdress],
  )

  return (
    <a.div className="main-content" style={style}>
      <div className="bg-[#F7F8FA] rounded-[8px] p-[16px]">
        <p className="flex items-center">
          <span className="text-[14px] text-[#A9ABB2]">From:</span>
          <span className="ml-[8px] text-[18px] text-[#2959B4]">
            Conflux Native-Space
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
      </div>

      <button
        id="btn-goto-evm2main"
        className="turn-btn absolute left-[50%] translate-x-[-50%] top-[110px] w-[32px] h-[32px] flex justify-center items-center bg-white rounded-full z-10 hover:scale-110 transition-transform"
        onClick={handleClickFlipped}
      >
        <img
          className="w-[20px] h-[20px]"
          src={PageTurn}
          alt="page-turn button"
          draggable="false"
        />
      </button>

      <form onSubmit={onSubmit}>
        <div className="relative mt-[16px] p-[16px] w-[432px] border-[1px] border-[#EAECEF] rounded-[8px]">
          <p className="flex items-center">
            <span className="text-[14px] text-[#A9ABB2]">To:</span>
            <span className="ml-[8px] text-[18px] text-[#15C184]">
              Conflux EVM-Space
            </span>
          </p>
          <input
            className="input mt-[8px]"
            id="evm-address"
            placeholder="Conflux EVM-Space Destination Address"
            pattern="0x[a-fA-F0-9]{40}"
            {...register('evmAddress', {
              pattern: /0x[a-fA-F0-9]{40}/g,
              required: true,
            })}
          />
          {<span className="invalid absolute right-[18px] top-[32px] text-[12px] text-[#E96170] opacity-0 transition-opacity">Invalid address</span>}
        </div>

        <div className="mt-[20px] mb-[16px] p-[12px] flex items-center text-[14px] text-[#3D3F4C] bg-[#F7F8FA] rounded-[2px]">
          <img
            className="mr-[8px] w-[24px] h-[24px]"
            src={CFXIcon}
            alt="cfx icon"
          />
          CFX (Conflux Network)
        </div>

        <AmountInput register={register} setAmount={setAmount} />

        <TransferButton />
      </form>
    </a.div>
  )
}

const AmountInput: React.FC<{
  register: UseFormRegister<FieldValues>
  setAmount: (val: string) => void
}> = memo(({register, setAmount}) => {
  const {balance, maxAvailableBalance} = useBalance()

  const handleCheckAmount = useCallback(
    async (evt: React.FocusEvent<HTMLInputElement, Element>) => {
      if (!evt.target.value) return;
      if (Number(evt.target.value) < 0) {
        return setAmount('')
      }

      if (!maxAvailableBalance) return
      if (
        Unit.fromDecimalCfx(evt.target.value).drip > maxAvailableBalance.drip
      ) {
        return setAmount(maxAvailableBalance.toDecimalCfx())
      }
      return setAmount(evt.target.value);
    },
    [maxAvailableBalance],
  )

  const handleClickMax = useCallback(() => {
    if (!maxAvailableBalance) return
    setAmount(maxAvailableBalance.toDecimalCfx())
  }, [maxAvailableBalance])

  return (
    <>
      <div
        className={classNames('input-within mb-[12px]', {
          disabled: !maxAvailableBalance
            ? true
            : maxAvailableBalance.drip === 0n,
        })}
      >
        <input
          id="input-amount"
          placeholder="Amount you want to transfer"
          type="number"
          step={1e-18}
          min={new Unit(1n).toDecimalCfx()}
          {...register('amount', { required: true, min: new Unit(1n).toDecimalCfx(), onBlur: handleCheckAmount})}
        />
        <div
          className="ml-4 text-[14px] text-[#808BE7] cursor-pointer hover:underline"
          onClick={handleClickMax}
        >
          MAX
        </div>
      </div>
      <p className="text-[14px] text-[#3D3F4C]">
        <span className="text-[#2959B4]" id="core-chain-balance">Native-Space</span> Balance:
        {typeof balance !== 'undefined' ? (
          (balance.drip !== 0n && balance.drip < Unit.fromDecimalCfx('0.000001').drip) ? (
            <span
              className="dfn dfn-center"
              data-info={balance.toDecimalCfx() + 'CFX'}
            >
              {' '}
              ＜0.000001 CFX
            </span>
          ) : (
            ` ${balance} CFX`
          )
        ) : (
          ''
        )}
      </p>
      <p className="mt-[20px] text-[14px] text-[#3D3F4C]" id="will-receive">
        Will receive on <span className="text-[#15C184]">EVM-Space</span>:{' '}
        <span id="receivedCFX"></span>
      </p>
    </>
  )
})

const TransferButton: React.FC = memo(() => {
  const {maxAvailableBalance} = useBalance()
  const isSupportEvmSpace = useIsSupportEvmSpace()
  
  return (
    <>
        <button
          id="btn-transfer"
          type="submit"
          className="mt-[24px] w-full h-[48px] button"
          disabled={!isSupportEvmSpace || maxAvailableBalance === undefined || maxAvailableBalance.drip === 0n}
        >
          Transfer
        </button>
    </>
  )
})

export default memo(Main2Evm)
