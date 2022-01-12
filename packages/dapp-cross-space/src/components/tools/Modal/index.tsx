import React, {memo} from 'react'
import {PopupClass} from '../../Popup'
import Success from '../../../assets/success.svg'
import Close from '../../../assets/close.svg'
import './index.css'

const WaitFluentModal = new PopupClass()
const TransactionSubmittedModal = new PopupClass()

const WaitFluentContent: React.FC = memo(() => {
  return (
    <div className="w-[340px] h-[150px] text-center bg-white rounded-[8px]">
      <div className="modal-spin mt-[24px]" />
      <p className="font-medium text-[16px] text-[#3D3F4C] mt-[12px] leading-[22px]">
        Waiting
      </p>
      <p className="mt-[8px] text-[14px] text-[#A9ABB2] leading-[18px]">
        Confirm the transaction in your Fluent wallet...
      </p>
    </div>
  )
})

const TransactionSubmittedContent: React.FC<{TxnHash: string}> = memo(
  ({TxnHash}) => {
    return (
      <div className="relative w-[340px] h-[192px] px-[24px] text-center bg-white rounded-lg ">
        <img
          className="absolute right-[12px] top-[12px] w-[16px] h-[16px] cursor-pointer hover:scale-110 transition-transform select-none"
          onClick={TransactionSubmittedModal.hideAll}
          src={Close}
          alt="close icon"
        />

        <img
          className="w-[48px] h-[48px] mt-[28px] mx-auto"
          src={Success}
          alt="success icon"
        />
        <p className="mt-[12px] font-medium text-[16px] leading-[22px] text-[#3D3F4C] text-center">
          Transaction Submitted
        </p>
        <p className="mt-[8px] text-[14px] leading-[18px] text-[#3D3F4C] text-left">
          Txn Hash:
        </p>
        <p className="text-[14px] leading-[18px] text-[#A9ABB2] text-left break-words">
          {TxnHash}
        </p>
      </div>
    )
  },
)

export const showWaitFluent = () =>
  WaitFluentModal.show({
    Content: <WaitFluentContent />,
    duration: 0,
    showMask: true,
    animationType: 'door',
  })

export const showTransactionSubmitted = (TxnHash: string) => {
  WaitFluentModal.hideAll()
  return TransactionSubmittedModal.show({
    Content: <TransactionSubmittedContent TxnHash={TxnHash} />,
    duration: 0,
    showMask: true,
    animationType: 'door',
  })
}

export const hideWaitFluent = (key: string | number) =>
  WaitFluentModal.hide(key)
export const hideTransactionSubmitted = (key: string | number) =>
  TransactionSubmittedModal.hide(key)
