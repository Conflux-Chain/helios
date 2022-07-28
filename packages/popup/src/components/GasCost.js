import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {DisplayBalance} from '../components'
import {useCurrentTicker} from '../hooks/useApi'
import {useEstimateTx} from '../hooks'
import useDebouncedValue from '../hooks/useDebouncedValue'

function GasCost({sendParams, networkTypeIsCfx}) {
  const {t} = useTranslation()
  const {symbol, decimals} = useCurrentTicker()
  const estimateRst = useEstimateTx(sendParams) || {}
  const {
    willPayCollateral,
    willPayTxFee,
    storageFeeDrip,
    gasFeeDrip,
    txFeeDrip,
  } = estimateRst
  const isBePayed = willPayCollateral === false || willPayTxFee === false
  const isBeAllPayed = willPayCollateral === false && willPayTxFee === false
  const partPayedFeeDrip =
    willPayCollateral === false ? gasFeeDrip : storageFeeDrip
  const partSponsoredFeeDrip =
    willPayCollateral === false ? storageFeeDrip : gasFeeDrip
  const realPayedFeeDrip = useDebouncedValue(
    isBeAllPayed ? '0x0' : isBePayed ? partPayedFeeDrip : txFeeDrip,
    [isBeAllPayed, isBePayed, partPayedFeeDrip, txFeeDrip],
  )
  const sponsoredFeeDrip = useDebouncedValue(
    isBeAllPayed ? txFeeDrip : isBePayed ? partSponsoredFeeDrip : '0x0',
    [isBeAllPayed, isBePayed, partPayedFeeDrip, txFeeDrip],
  )
  return (
    <div className="flex flex-col border-b border-gray-20 mb-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-40 font-medium">{t('gasCost')}</span>
        <DisplayBalance
          id="realPayedFee"
          balance={realPayedFeeDrip}
          maxWidth={230}
          maxWidthStyle="max-w-[230px]"
          className="!font-bold"
          symbol={symbol}
          decimals={decimals}
        />
      </div>
      {networkTypeIsCfx && (
        <>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-40 font-medium">{t('sponsored')}</span>
            <span className="text-gray-80 font-medium flex items-center">
              {sponsoredFeeDrip === '0x0' ? '' : '-'}
              <DisplayBalance
                id="soponsoredFee"
                balance={sponsoredFeeDrip}
                maxWidth={230}
                maxWidthStyle="max-w-[230px]"
                className="!font-medium"
                symbol={symbol}
                decimals={decimals}
              />
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-40 font-medium">{t('gasFee')}</span>
            <DisplayBalance
              id="gasFee"
              balance={gasFeeDrip}
              maxWidth={230}
              maxWidthStyle="max-w-[230px]"
              className="!font-medium"
              symbol={symbol}
              decimals={decimals}
            />
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-40 font-medium">{t('storageFee')}</span>
            <DisplayBalance
              id="storageFee"
              balance={storageFeeDrip}
              maxWidth={230}
              maxWidthStyle="max-w-[230px]"
              className="!font-medium"
              symbol={symbol}
              decimals={decimals}
            />
          </div>
        </>
      )}
    </div>
  )
}

GasCost.propTypes = {
  sendParams: PropTypes.object,
  networkTypeIsCfx: PropTypes.bool,
}

export default GasCost
