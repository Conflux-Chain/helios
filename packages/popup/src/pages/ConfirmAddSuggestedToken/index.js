import {useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {formatBalance} from '@fluent-wallet/data-format'
import {useFontSize} from '../../hooks'
import {DappTransactionHeader, DappTransactionFooter} from '../../components'

function ConfirmAddSuggestedToken() {
  const {t} = useTranslation()
  const balanceRef = useRef()
  const hiddenRef = useRef()
  const maxBalanceWidthStyle = 'max-w-[184px]'
  const balance = '12311231212312222222222123321'
  useFontSize(balanceRef, hiddenRef, 184, balance)

  return (
    <div
      id="confirmAddSuggestedTokenContainer"
      className="flex flex-col h-full justify-between bg-blue-circles bg-no-repeat"
    >
      <div>
        <DappTransactionHeader
          title={t('addSuggestedToken')}
          avatar={<img src="" alt="avatar" className="h-8 w-8" />}
          nickName="Mock Account"
          address="iammockaddressiammockaddressiammockaddress"
        />
        <main className="rounded-t-xl pt-4 px-3 bg-gray-0">
          <p className="text-sm text-gray-80 font-medium pb-2 ml-1">
            {t('confirmAddSuggestedToken')}
          </p>
          <div className="bg-bg rounded flex items-center h-14 px-3">
            <div className="flex">
              <img src="" alt="coin" className="h-8 w-8 mr-2" />
              <div>
                <div className="font-medium text-sm text-gray-80">ZRX</div>
                <div className="text-xs text-gray-40">0x Protocol</div>
              </div>
            </div>
            <div className="flex items-center flex-1 justify-end">
              <div
                className={`${maxBalanceWidthStyle} text-gray-80 font-semibold text-sm whitespace-nowrap overflow-hidden overflow-ellipsis`}
              >
                <span ref={balanceRef}>{formatBalance(balance)}</span>
                <span ref={hiddenRef} className="invisible">
                  {formatBalance(balance)}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
      <DappTransactionFooter
        cancelText={t('cancel')}
        confirmText={t('addToken')}
      />
    </div>
  )
}

export default ConfirmAddSuggestedToken
