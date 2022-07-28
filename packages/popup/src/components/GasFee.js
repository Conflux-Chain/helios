import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Link from '@fluent-wallet/component-link'
import {formatBalance, GWEI_DECIMALS} from '@fluent-wallet/data-format'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {DisplayBalance, CustomTag} from '../components'
import {useIsCfxChain, useCurrentTicker} from '../hooks/useApi'
import {useCurrentTxStore} from '../hooks'
import useDebouncedValue from '../hooks/useDebouncedValue'
import {ROUTES} from '../constants'
const {EDIT_GAS_FEE} = ROUTES

function GasFee({
  estimateRst,
  isTxTreatedAsEIP1559 = false,
  titleDes,
  goEdit = true,
  showDrip = true,
  titleClassName = 'mb-2',
  contentClassName = '',
}) {
  const {gasPrice, maxFeePerGas, gasLevel} = useCurrentTxStore()
  const txGasPrice = isTxTreatedAsEIP1559 ? maxFeePerGas : gasPrice
  const {t} = useTranslation()
  const history = useHistory()
  const isCfxChain = useIsCfxChain()
  const {symbol, decimals} = useCurrentTicker()
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

  const displayGasPrice = useDebouncedValue(txGasPrice, [txGasPrice])

  return (
    <div className="gas-fee-container flex flex-col">
      <header
        className={`gas-fee-header flex items-center justify-between w-full text-gray-40 ${titleClassName}`}
      >
        {titleDes || t('gasFee')}
        {goEdit && (
          <span className="flex items-center">
            <Link
              onClick={() => history.push(EDIT_GAS_FEE)}
              disabled={!realPayedFeeDrip || !displayGasPrice}
            >
              {isTxTreatedAsEIP1559 ? t(gasLevel) : t('edit')}
              <RightOutlined className="w-3 h-3 text-primary ml-1" />
            </Link>
          </span>
        )}
      </header>
      <div
        className={`gas-fee-body flex flex-col bg-gray-4 border-gray-10 rounded px-2 py-3 relative ${contentClassName}`}
        id="gasFeeContainer"
      >
        <DisplayBalance
          id="realPayedFee"
          balance={realPayedFeeDrip}
          maxWidth={202}
          maxWidthStyle="max-w-[202px]"
          className="text-lg mb-0.5 font-medium"
          symbol={symbol}
          decimals={decimals}
          initialFontSize={20}
        />
        {isBePayed && sponsoredFeeDrip !== '0x0' && (
          <div className="flex text-gray-40">
            <span>{`${t('sponsored')}:`}&nbsp;</span>
            <DisplayBalance
              id="sponsoredFee"
              balance={sponsoredFeeDrip}
              maxWidth={230}
              maxWidthStyle="max-w-[230px]"
              className="!text-gray-40 !font-normal mb-0.5"
              symbol={symbol}
              decimals={decimals}
            />
          </div>
        )}
        {showDrip && (
          <span className="text-xs text-gray-60">{`${formatBalance(
            displayGasPrice,
            GWEI_DECIMALS,
          )} ${isCfxChain ? 'GDrip' : 'GWei'}`}</span>
        )}
        {isBePayed && sponsoredFeeDrip !== '0x0' && (
          <CustomTag
            width="w-auto"
            textColor="text-white"
            backgroundColor="bg-[#44d7b6]"
            className="absolute right-0 top-0 !h-6 px-2"
          >
            <span className="text-2xs text-white">
              {isBeAllPayed ? t('sponsored') : t('partSponsored')}
            </span>
          </CustomTag>
        )}
      </div>
    </div>
  )
}

GasFee.propTypes = {
  estimateRst: PropTypes.object,
  titleDes: PropTypes.string,
  titleClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  goEdit: PropTypes.bool,
  showDrip: PropTypes.bool,
  isTxTreatedAsEIP1559: PropTypes.bool,
}

export default GasFee
