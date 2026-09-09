import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Link from '@fluent-wallet/component-link'
import {formatBalance, GWEI_DECIMALS} from '@fluent-wallet/data-format'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {useIsCfxChain, useCurrentTicker} from '../hooks/useApi'
import {useCurrentTxStore} from '../hooks'
import useDebouncedValue from '../hooks/useDebouncedValue'
import {ROUTES} from '../constants'
import DisplayBalance from './DisplayBalance'
import GasFeeCard from './GasFeeCard'
const {EDIT_GAS_FEE} = ROUTES

function GasFee({
  estimateRst,
  uses1559Fees = false,
  titleDes,
  goEdit = true,
  showDrip = true,
  titleClassName = 'mb-2',
  contentClassName = '',
  prefix,
  suffix,
  displayFee,
  sponsored = false,
  editDisabled = false,
  editLabel,
}) {
  const {gasPrice, maxFeePerGas, gasLevel} = useCurrentTxStore()
  const txGasPrice = uses1559Fees ? maxFeePerGas : gasPrice
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
  const feeBalance = displayFee?.balance ?? realPayedFeeDrip
  const feeSymbol = displayFee?.symbol ?? symbol
  const feeDecimals = displayFee?.decimals ?? decimals
  const hasExistingSponsorship = isBePayed && sponsoredFeeDrip !== '0x0'
  const isEditDisabled = editDisabled || !feeBalance || !displayGasPrice

  const action = goEdit ? (
    <span className="flex items-center">
      <Link
        onClick={() => history.push(EDIT_GAS_FEE)}
        disabled={isEditDisabled}
      >
        {editLabel || (uses1559Fees ? t(gasLevel) : t('edit'))}
        <RightOutlined
          className={`ml-1 h-3 w-3 ${
            editDisabled ? 'text-gray-40' : 'text-primary'
          }`}
        />
      </Link>
    </span>
  ) : null

  const statusTag =
    sponsored || hasExistingSponsorship ? (
      <span className="text-2xs text-white">
        {sponsored || isBeAllPayed ? t('sponsored') : t('partSponsored')}
      </span>
    ) : null

  return (
    <GasFeeCard
      title={titleDes || t('gasFee')}
      action={action}
      prefix={prefix}
      suffix={suffix}
      statusTag={statusTag}
      titleClassName={titleClassName}
      contentClassName={contentClassName}
    >
      <DisplayBalance
        id="realPayedFee"
        balance={feeBalance}
        maxWidth={202}
        maxWidthStyle="max-w-[202px]"
        className={`text-lg mb-0.5 font-medium ${
          sponsored ? '!text-gray-40 line-through' : ''
        }`}
        symbol={feeSymbol}
        decimals={feeDecimals}
        initialFontSize={20}
      />

      {!sponsored && hasExistingSponsorship && (
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
        <span className="text-xs text-gray-60">
          {`${formatBalance(displayGasPrice, GWEI_DECIMALS)} ${
            isCfxChain ? 'GDrip' : 'GWei'
          }`}
        </span>
      )}
    </GasFeeCard>
  )
}

GasFee.propTypes = {
  estimateRst: PropTypes.object,
  titleDes: PropTypes.node,
  titleClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  goEdit: PropTypes.bool,
  showDrip: PropTypes.bool,
  uses1559Fees: PropTypes.bool,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  displayFee: PropTypes.shape({
    balance: PropTypes.string,
    symbol: PropTypes.string,
    decimals: PropTypes.number,
  }),
  sponsored: PropTypes.bool,
  editDisabled: PropTypes.bool,
  editLabel: PropTypes.string,
}

export default GasFee
