import React, {memo} from 'react'
import {PopupClass} from '../../Popup'

const WaitFluentModal = new PopupClass()
const TransactionSubmittedModal = new PopupClass()

const WaitFluentContent: React.FC = memo(() => {
  return (
    <div className="w-[400px] h-[140px] text-center bg-white rounded-lg">
      <p className="font-medium text-xl mt-[32px]">Waiting</p>
      <p className="mt-[16px]">
        Confirm the transaction in your Fluent wallet...
      </p>
    </div>
  )
})

const TransactionSubmittedContent: React.FC<{TxnHash: string}> = memo(
  ({TxnHash}) => {
    return (
      <div className="relative w-[400px] h-[300px] px-[24px] text-center bg-white rounded-lg ">
        <svg
          className="absolute right-[20px] top-[20px] cursor-pointer hover:scale-110 transition-transform select-none"
          onClick={TransactionSubmittedModal.hideAll}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.65496 0L0.0100301 1.38C2.93882 3.56 5.667 6.06 8.06419 8.56C4.39318 12.25 1.51454 15.88 0 17.34L3.12939 19.95C4.24273 17.66 6.65998 14.19 9.8997 10.55C13.1394 14.21 15.5667 17.7 16.68 20C16.68 20 19.7292 16.77 20 17.27C18.8265 15.95 15.9579 12.11 12.1063 8.18C14.3129 5.92 16.7904 3.68 19.4383 1.71L18.7161 0.37C15.7172 1.86 12.8586 4.07 10.2909 6.42C7.70311 3.97 4.77432 1.64 1.65496 0Z"
            fill="black"
          />
        </svg>

        <p className="font-medium text-xl mt-[32px]">Transaction Submitted</p>
        <svg
          className="mx-auto mt-[24px] mb-[18px]"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="88"
          height="88"
        >
          <path
            d="M666.272 472.288l-175.616 192a31.904 31.904 0 0 1-23.616 10.4h-0.192a32 32 0 0 1-23.68-10.688l-85.728-96a32 32 0 1 1 47.744-42.624l62.144 69.6 151.712-165.888a32 32 0 1 1 47.232 43.2m-154.24-344.32C300.224 128 128 300.32 128 512c0 211.776 172.224 384 384 384 211.68 0 384-172.224 384-384 0-211.68-172.32-384-384-384"
            p-id="2170"
            fill="#22c55e"
          ></path>
        </svg>
        <p className="text-left">Txn Hash:</p>
        <p className="mt-1 text-left break-words">{TxnHash}</p>
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
