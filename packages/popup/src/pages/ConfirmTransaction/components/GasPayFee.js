import {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Tooltip from '@fluent-wallet/component-tooltip'
import {
  DownOutlined,
  QuestionCircleOutlined,
  RightOutlined,
} from '@fluent-wallet/component-icons'
import Link from '@fluent-wallet/component-link'
import {DisplayBalance, GasFee} from '../../../components'
import {useCheckImage, useCurrentTxStore} from '../../../hooks'
import {GAS_PAYMENT_METHOD, ROUTES} from '../../../constants'
import {formatQuoteAmount, getTokenIcon} from './tokenPayGasUtils'
import GasPaymentSelector from './GasPaymentSelector'

const {EDIT_GAS_FEE} = ROUTES

function GasPayHeader({children}) {
  const {t} = useTranslation()
  return (
    <header className="mb-2 flex items-center text-gray-40">
      <span>{t('gasFee')}</span>
      <Tooltip content={t('gasPayFeeTooltip')} placement="top">
        <QuestionCircleOutlined className="ml-1 h-3.5 w-3.5 cursor-pointer text-gray-40" />
      </Tooltip>
      {children}
    </header>
  )
}

function GasPaymentHeader({uses1559Fees, disabled, label}) {
  const {t} = useTranslation()
  const history = useHistory()
  const {gasLevel} = useCurrentTxStore()

  return (
    <header className="gas-fee-header mb-2 flex w-full items-center justify-between text-gray-40">
      <div className="flex items-center">
        <span>{t('gasFee')}</span>
        <Tooltip content={t('gasPayFeeTooltip')} placement="top">
          <QuestionCircleOutlined className="ml-1 h-3.5 w-3.5 cursor-pointer text-gray-40" />
        </Tooltip>
      </div>
      <Link onClick={() => history.push(EDIT_GAS_FEE)} disabled={disabled}>
        {label || (uses1559Fees ? t(gasLevel) : t('edit'))}
        <RightOutlined
          className={`ml-1 h-3 w-3 ${
            disabled ? 'text-gray-40' : 'text-primary'
          }`}
        />
      </Link>
    </header>
  )
}

function NativeGasPayFee({estimateRst, uses1559Fees, nativeToken, onOpen}) {
  const nativeTokenIcon = getTokenIcon(nativeToken)
  const isImgUrl = useCheckImage(nativeTokenIcon)

  return (
    <>
      <GasFee
        estimateRst={estimateRst}
        uses1559Fees={uses1559Fees}
        titleDes={<GasPayHeader />}
        prefix={
          <button
            type="button"
            className="flex mr-2 items-center justify-center rounded-full bg-gray-0"
            onClick={onOpen}
          >
            <img
              src={
                isImgUrl ? nativeTokenIcon : '/images/default-token-icon.svg'
              }
              alt=""
              className="h-8 w-8 rounded-full"
            />
          </button>
        }
        suffix={
          <button
            type="button"
            className="flex ml-2 h-8 w-8 items-center justify-center"
            onClick={onOpen}
          >
            <DownOutlined className="h-4 w-4 text-gray-60" />
          </button>
        }
      />
    </>
  )
}

function TokenGasPayFee({gasToken, quote, options, uses1559Fees, onOpen}) {
  const displayToken = quote?.gasToken || gasToken || {}
  const displayTokenIcon = getTokenIcon(displayToken)
  const isImgUrl = useCheckImage(displayTokenIcon)
  const option = options?.tokens?.[gasToken?.address?.toLowerCase()]
  const displayTokenCost = quote?.tokenCost || option?.estimatedTokenAmount
  const displayQuoteAmount = quote?.quoteAmount || option?.estimatedQuoteAmount
  const displayQuoteToken = quote?.quoteToken || options?.quoteToken
  const subText = formatQuoteAmount(displayQuoteAmount, displayQuoteToken)

  return (
    <div className="gas-pay-fee-container flex flex-col">
      <GasPaymentHeader
        uses1559Fees={uses1559Fees}
        disabled={!displayTokenCost}
      />
      <button
        type="button"
        className="relative flex w-full items-center rounded border border-gray-10 px-3 py-3 text-left"
        onClick={onOpen}
      >
        <img
          src={isImgUrl ? displayTokenIcon : '/images/default-token-icon.svg'}
          alt=""
          className="mr-3 h-8 w-8 rounded-full shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <DisplayBalance
            id="tokenPayGasFee"
            balance={displayTokenCost}
            decimals={displayToken?.decimals}
            symbol={displayToken?.symbol}
            maxWidth={190}
            maxWidthStyle="max-w-[190px]"
            className="text-base font-medium"
            initialFontSize={16}
          />
          <span className="mt-1 text-xs text-gray-60 truncate">{subText}</span>
        </div>
        <DownOutlined className="ml-2 h-4 w-4 shrink-0 text-gray-60" />
      </button>
    </div>
  )
}

function SponsoredGasPayFee({
  sponsorship,
  nativeToken,
  estimateRst,
  uses1559Fees,
}) {
  const {t} = useTranslation()
  const nativeTokenIcon = getTokenIcon(nativeToken)
  const isImgUrl = useCheckImage(nativeTokenIcon)

  return (
    <GasFee
      estimateRst={estimateRst}
      uses1559Fees={uses1559Fees}
      showDrip={false}
      displayFee={{
        balance: sponsorship.maxGasCost,
        symbol: nativeToken?.symbol,
        decimals: nativeToken?.decimals,
      }}
      sponsored
      editDisabled
      editLabel={t('medium')}
      prefix={
        <div className="mr-2 flex items-center justify-center rounded-full bg-gray-0">
          <img
            src={isImgUrl ? nativeTokenIcon : '/images/default-token-icon.svg'}
            alt=""
            className="h-8 w-8 rounded-full"
          />
        </div>
      }
    />
  )
}

function GasPayFee({
  payment,
  sponsorship,
  gasToken,
  tokenPayConfig,
  quote,
  options,
  nativeToken,
  nativeBalance,
  nativeGasFee,
  gasTokenBalances,
  estimateRst,
  uses1559Fees,
  onSelectPayment,
  onSelectGasToken,
  isDeferredMax,
  sendTokenAddress,
  sendTokenAmount,
}) {
  const [selectorOpen, setSelectorOpen] = useState(false)
  const selectedTokenOption =
    options?.tokens?.[gasToken?.address?.toLowerCase()]
  const selectedGasTokenAmount =
    quote?.tokenCost || selectedTokenOption?.estimatedTokenAmount
  const selectedGasTokenQuoteAmount =
    quote?.quoteAmount || selectedTokenOption?.estimatedQuoteAmount
  const quoteToken =
    quote?.quoteToken || options?.quoteToken || tokenPayConfig?.quoteToken

  let fee
  if (payment?.method === GAS_PAYMENT_METHOD.SPONSORED) {
    fee = (
      <SponsoredGasPayFee
        sponsorship={sponsorship}
        nativeToken={nativeToken}
        estimateRst={estimateRst}
        uses1559Fees={uses1559Fees}
      />
    )
  } else if (payment?.method === GAS_PAYMENT_METHOD.TOKEN && gasToken) {
    fee = (
      <TokenGasPayFee
        gasToken={gasToken}
        quote={quote}
        options={options}
        uses1559Fees={uses1559Fees}
        onOpen={() => setSelectorOpen(true)}
      />
    )
  } else {
    fee = (
      <NativeGasPayFee
        estimateRst={estimateRst}
        uses1559Fees={uses1559Fees}
        nativeToken={nativeToken}
        onOpen={() => setSelectorOpen(true)}
      />
    )
  }

  return (
    <>
      {fee}
      {payment?.method !== GAS_PAYMENT_METHOD.SPONSORED && (
        <GasPaymentSelector
          open={selectorOpen}
          onClose={() => setSelectorOpen(false)}
          payment={payment}
          tokenPayConfig={tokenPayConfig}
          options={options}
          nativeToken={nativeToken}
          nativeBalance={nativeBalance}
          nativeGasFee={nativeGasFee}
          tokenBalances={gasTokenBalances}
          selectedGasToken={gasToken}
          selectedGasTokenAmount={selectedGasTokenAmount}
          selectedGasTokenQuoteAmount={selectedGasTokenQuoteAmount}
          quoteToken={quoteToken}
          onSelectPayment={onSelectPayment}
          onSelectGasToken={onSelectGasToken}
          isDeferredMax={isDeferredMax}
          sendTokenAddress={sendTokenAddress}
          sendTokenAmount={sendTokenAmount}
        />
      )}
    </>
  )
}

GasPayHeader.propTypes = {
  children: PropTypes.node,
}

GasPaymentHeader.propTypes = {
  uses1559Fees: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
}

NativeGasPayFee.propTypes = {
  estimateRst: PropTypes.object,
  uses1559Fees: PropTypes.bool,
  nativeToken: PropTypes.object,
  onOpen: PropTypes.func,
}

TokenGasPayFee.propTypes = {
  quote: PropTypes.object,
  gasToken: PropTypes.object,
  options: PropTypes.object,
  uses1559Fees: PropTypes.bool,
  onOpen: PropTypes.func,
}

SponsoredGasPayFee.propTypes = {
  sponsorship: PropTypes.shape({
    maxGasCost: PropTypes.string,
  }).isRequired,
  nativeToken: PropTypes.object,
  estimateRst: PropTypes.object,
  uses1559Fees: PropTypes.bool,
}

GasPayFee.propTypes = {
  payment: PropTypes.shape({
    method: PropTypes.oneOf(Object.values(GAS_PAYMENT_METHOD)),
    tokenAddress: PropTypes.string,
  }),
  sponsorship: PropTypes.object,
  gasToken: PropTypes.object,
  tokenPayConfig: PropTypes.object,
  quote: PropTypes.object,
  options: PropTypes.object,
  nativeToken: PropTypes.object,
  nativeBalance: PropTypes.string,
  nativeGasFee: PropTypes.string,
  gasTokenBalances: PropTypes.object,
  estimateRst: PropTypes.object,
  uses1559Fees: PropTypes.bool,
  onSelectPayment: PropTypes.func,
  onSelectGasToken: PropTypes.func,
  isDeferredMax: PropTypes.bool,
  sendTokenAddress: PropTypes.string,
  sendTokenAmount: PropTypes.string,
}

export default GasPayFee
