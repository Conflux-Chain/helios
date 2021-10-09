import {useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {formatIntoShortAddress} from '../../utils'
import Button from '@fluent-wallet/component-button'
import {formatBalance} from '@fluent-wallet/data-format'
import {useFontSize} from '../../hooks'

function ConfirmAddSuggestedToken() {
  const {t} = useTranslation()
  const balanceRef = useRef()
  const hiddenRef = useRef()
  const maxBalanceWidthStyle = 'max-w-[156px]'
  const balance = '12311231212312222222222123321'
  useFontSize(balanceRef, hiddenRef, 156, balance)

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <header className="bg-blue-circles bg-no-repeat">
          <p className="text-sm text-gray-100 text-center h-13 flex justify-center items-center">
            {t('addSuggestedToken')}
          </p>
          <div className="flex mt-1 mr-2 px-4 pb-3">
            <img src="" alt="avatar" className="h-8 w-8" />
            <div>
              <p className="text-xs text-gray-40">mock account</p>
              <p className="text-sm text-gray-80 font-medium">
                {formatIntoShortAddress(
                  'iammockaddressiammockaddressiammockaddress',
                )}
              </p>
            </div>
          </div>
        </header>
        <main className="rounded-t-xl pt-4 px-3">
          <div>
            <p className="text-sm text-gray-80 font-medium pb-2 ml-1">
              {t('confirmAddSuggestedToken')}
            </p>
            <div className="bg-bg rounded flex items-center h-14 px-3">
              <div className="flex flex-1">
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
          </div>
        </main>
      </div>
      <footer className="flex px-4">
        <Button className="flex-1" variant="outlined" key="cancel">
          {t('cancel')}
        </Button>
        <div className="w-3" />
        <Button className="flex-1">{t('addToken')}</Button>
      </footer>
    </div>
  )
}

export default ConfirmAddSuggestedToken
