import PropTypes from 'prop-types'
import {useState, useEffect, useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {
  Big,
  formatDecimalToHex,
  formatHexToDecimal,
  convertDecimal,
  GWEI_DECIMALS,
} from '@fluent-wallet/data-format'
import Button from '@fluent-wallet/component-button'
import {Radio, Group} from '@fluent-wallet/radio'
import useInputErrorAnimation from '@fluent-wallet/component-input/useAnimation'
import {EditOutlined} from '@fluent-wallet/component-icons'
import {consts} from '@fluent-wallet/ledger'
import {
  NumberInput,
  GasFee,
  SlideCard,
  TransactionResult,
  DisplayBalance,
} from '../../../components'
import {ExecutedTransaction} from './'
import {
  useNetworkTypeIsCfx,
  useCfxMaxGasLimit,
  useCurrentAddress,
} from '../../../hooks/useApi'

import {
  useEstimateTx,
  useDecodeData,
  useCheckBalanceAndGas,
  useLedgerBindingApi,
} from '../../../hooks'
import useLoading from '../../../hooks/useLoading'
import {request, checkBalance} from '../../../utils'
import {RPC_METHODS, TX_STATUS, NETWORK_TYPE} from '../../../constants'

const {CFX_SEND_TRANSACTION, ETH_SEND_TRANSACTION} = RPC_METHODS
const {LEDGER_APP_NAME} = consts

function ResendTransaction({
  reSendType,
  onClose,
  transactionRecord = {},
  reSendTxStatus = 'pending',
  refreshHistoryData,
}) {
  const ledgerBindingApi = useLedgerBindingApi()

  const {t} = useTranslation()
  const {setLoading} = useLoading()

  const [gasPrice, setGasPrice] = useState('')
  const [gasLimit, setGasLimit] = useState('')
  const [minimumGasPrice, setMinimumGasPrice] = useState('')

  const [showGasLimitInput, setShowGasLimitInput] = useState(false)
  const [suggestedGasPrice, setSuggestedGasPrice] = useState('')
  const [gasPriceChoice, setGasPriceChoice] = useState('recommend')
  const [executedTxResultStatus, setExecutedTxResultStatus] = useState(false)

  // for hw account
  const [hwAccountError, setHwAccountError] = useState('')
  const [sendStatus, setSendStatus] = useState('')

  const [gasPriceErr, setGasPriceErr] = useState('')
  const [gasLimitErr, setGasLimitErr] = useState('')
  const [balanceError, setBalanceError] = useState('')
  const [sendError, setSendError] = useState({})
  const [canResend, setCanResend] = useState(true)

  const {
    errorAnimateStyle: gasPriceAnimateStyle,
    displayErrorMsg: gasPriceDisplayErr,
  } = useInputErrorAnimation(gasPriceErr)

  const {
    errorAnimateStyle: balanceHwAnimateStyle,
    displayErrorMsg: balanceHwDisplayErr,
  } = useInputErrorAnimation(balanceError || hwAccountError)

  const {
    data: {
      account,
      network: {type: networkType},
    },
  } = useCurrentAddress()
  const accountType = account?.accountGroup?.vault?.type

  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const cfxMaxGasLimit = useCfxMaxGasLimit(networkTypeIsCfx)
  const minUnit = networkTypeIsCfx ? 'GDrip' : 'GWei'
  const SEND_TRANSACTION = networkTypeIsCfx
    ? CFX_SEND_TRANSACTION
    : ETH_SEND_TRANSACTION

  const {payload, token, extra} = transactionRecord
  const {simple, token20} = extra
  const {
    data,
    from,
    to,
    nonce,
    value,
    gasPrice: lastGasPrice,
    gas: lastGasLimit,
  } = payload

  // when cancel tx,only need to send zero native token to current address
  const isSpeedup = reSendType === 'speedup'

  // decode erc20 data
  const {decodeData} = useDecodeData(
    isSpeedup
      ? {
          to,
          data,
        }
      : {},
  )

  const isSendingToken =
    isSpeedup &&
    token20 &&
    token &&
    (decodeData?.name === 'transfer' || decodeData?.name === 'transferFrom')

  const sendTokenValue = isSendingToken
    ? decodeData.name === 'transfer'
      ? decodeData.args[1]._hex
      : decodeData.args[2]._hex
    : '0x0'

  const token20Params = isSendingToken
    ? {
        [token.address]: sendTokenValue,
      }
    : {}

  const txParams = isSpeedup
    ? {
        from,
        to,
        nonce,
        value,
        data,
      }
    : {
        from,
        to: from,
        nonce,
        value: '0x0',
      }

  const originEstimateRst = useEstimateTx(txParams, token20Params) || {}

  const estimateRst =
    useEstimateTx(
      {
        ...txParams,
        gasPrice: gasPrice
          ? formatDecimalToHex(
              convertDecimal(gasPrice, 'multiply', GWEI_DECIMALS),
            )
          : lastGasPrice,
        gas: gasLimit ? formatDecimalToHex(gasLimit) : lastGasLimit,
      },
      token20Params,
    ) || {}

  // check balance
  const errorMessage = useCheckBalanceAndGas(
    estimateRst,
    isSendingToken ? to : null,
    isSpeedup ? simple : true,
    isSpeedup ? isSendingToken || simple : true,
  )

  useEffect(() => {
    if (!estimateRst?.loading) {
      setBalanceError(errorMessage)
    }
  }, [errorMessage, estimateRst?.loading])

  // set default gas price
  useEffect(() => {
    if (lastGasPrice && originEstimateRst?.gasPrice) {
      const decimalGasPrice = formatHexToDecimal(lastGasPrice)
      const decimalEstimateGasPrice = formatHexToDecimal(
        originEstimateRst?.gasPrice,
      )

      const biggerGasPrice = new Big(decimalGasPrice).times(1.1).toString(10)

      const recommendGasPrice = new Big(biggerGasPrice).gt(
        decimalEstimateGasPrice,
      )
        ? biggerGasPrice
        : decimalEstimateGasPrice
      const displayRecommendGasPrice = new Big(
        convertDecimal(recommendGasPrice, 'divide', GWEI_DECIMALS),
      )
        .round(GWEI_DECIMALS, 3)
        .toString(10)
      const lastGasPricePlusOne = new Big(decimalGasPrice).plus(1).toString(10)
      const minGasPrice = new Big(lastGasPricePlusOne).gt(
        decimalEstimateGasPrice,
      )
        ? lastGasPricePlusOne
        : decimalEstimateGasPrice
      const displayMinGasPrice = convertDecimal(
        minGasPrice,
        'divide',
        GWEI_DECIMALS,
      ).toString(10)
      setSuggestedGasPrice(displayRecommendGasPrice)
      setGasPrice(displayRecommendGasPrice)
      setMinimumGasPrice(displayMinGasPrice)
    }
  }, [originEstimateRst?.gasPrice, lastGasPrice])

  // set default gas limit
  useEffect(() => {
    if (lastGasLimit) {
      setGasLimit(formatHexToDecimal(lastGasLimit))
    }
  }, [lastGasLimit])

  const onChangeGasPrice = val => {
    if (!minimumGasPrice) {
      return
    }
    setGasPrice(val)
    if (new Big(val || '0').gte(minimumGasPrice)) {
      setGasPriceErr('')
    } else {
      setGasPriceErr(
        t('gasPriceErrMSg', {
          amount: minimumGasPrice,
          unit: minUnit,
        }),
      )
    }
  }

  // change submit button status
  useEffect(() => {
    if (gasPrice && gasLimit && !gasPriceErr && !gasLimitErr && !balanceError) {
      return setCanResend(true)
    }
    setCanResend(false)
  }, [gasPrice, gasLimit, gasPriceErr, gasLimitErr, balanceError])

  const onCloseCard = useCallback(
    (args = {}) => {
      onClose?.()
      resetForm(args)
    },
    [onClose],
  )

  //cancel resend tx when tx status is not pending
  useEffect(() => {
    if (
      reSendTxStatus &&
      reSendTxStatus !== 'pending' &&
      reSendTxStatus !== 'sending'
    ) {
      setExecutedTxResultStatus(true)
      onCloseCard({restSendStatus: true})
      setLoading(false)
    }
  }, [onCloseCard, reSendTxStatus, setLoading])

  const resetForm = ({restSendStatus}) => {
    setGasPrice('')
    setGasLimit('')
    setMinimumGasPrice('')
    setShowGasLimitInput(false)
    setSuggestedGasPrice('')
    setGasPriceChoice('recommend')
    setGasPriceErr('')
    setGasLimitErr('')
    setBalanceError('')
    setCanResend(true)
    !!restSendStatus && setSendStatus('')
    setHwAccountError('')
  }

  const onChangeGasLimit = val => {
    setGasLimit(val)
    if (new Big(val || '0').lt(formatHexToDecimal(lastGasLimit || '21000'))) {
      setGasLimitErr(
        t('gasLimitMinErr', {
          gasUsed: formatHexToDecimal(lastGasLimit || '21000'),
        }),
      )
    } else if (
      cfxMaxGasLimit &&
      new Big(val || '0').gt(formatHexToDecimal(cfxMaxGasLimit))
    ) {
      setGasLimitErr(
        t('gasLimitMaxErr', {
          gasMax: formatHexToDecimal(cfxMaxGasLimit),
        }),
      )
    } else {
      setGasLimitErr('')
    }
  }

  const getSendTxParams = () => {
    let params = {}
    const _params = {
      ...txParams,
      gasPrice: formatDecimalToHex(
        convertDecimal(gasPrice, 'multiply', GWEI_DECIMALS),
      ),
      gas: formatDecimalToHex(gasLimit),
      storageLimit: estimateRst.storageCollateralized,
    }

    Object.keys(_params)
      .filter(_k => !!_params[_k])
      .forEach(k => {
        params[k] = _params[k]
      })
    return params
  }

  const resendTransaction = (params, isHwAccount) => {
    request(SEND_TRANSACTION, [params])
      .then(() => {
        if (reSendTxStatus !== 'pending' && reSendTxStatus !== 'sending') {
          return
        }
        refreshHistoryData?.()
        if (!isHwAccount) {
          setLoading(false)
          onCloseCard({restSendStatus: true})
          return
        }

        setSendStatus(TX_STATUS.HW_SUCCESS)
      })
      .catch(error => {
        if (reSendTxStatus !== 'pending' && reSendTxStatus !== 'sending') {
          return
        }
        !isHwAccount && setLoading(false)
        if (error?.data?.includes?.('too stale nonce')) {
          if (isHwAccount) {
            setSendStatus('')
          } else {
            onCloseCard({restSendStatus: true})
          }
          return
        }
        setSendStatus(TX_STATUS.ERROR)
        setSendError(error)
      })
  }

  const onResend = async () => {
    if (estimateRst?.loading || !accountType) {
      return
    }
    const isHwAccount = accountType === 'hw'

    if (isHwAccount) {
      if (!ledgerBindingApi) {
        return
      }

      const authStatus = await ledgerBindingApi.isDeviceAuthed()
      const isAppOpen = await ledgerBindingApi.isAppOpen()

      if (!authStatus) {
        return setHwAccountError(t('connectLedger'))
      }
      if (!isAppOpen) {
        return setHwAccountError(
          t('openLedgerApp', {
            type:
              networkType == NETWORK_TYPE.CFX
                ? LEDGER_APP_NAME.CONFLUX
                : LEDGER_APP_NAME.ETHEREUM,
          }),
        )
      }

      setSendStatus(TX_STATUS.HW_WAITING)
    } else {
      setLoading(true)
    }

    const params = getSendTxParams()
    const error = await checkBalance(
      params,
      token || {},
      isSpeedup ? simple : true,
      isSpeedup ? isSendingToken || simple : true,
      sendTokenValue,
      networkTypeIsCfx,
    )

    if (error) {
      setLoading(false)
      setBalanceError(t(error))
      setSendStatus('')
      return
    }

    resendTransaction(params, isHwAccount)
    isHwAccount && onCloseCard()
  }

  const onCloseTransactionResult = () => {
    setSendStatus('')
    setSendError({})
  }

  const onChangeGasPriceChoice = e => {
    setGasPriceChoice(e.target.value)
    if (e.target.value === 'recommend') {
      setGasPrice(suggestedGasPrice)
      setGasPriceErr('')
    }
  }

  return (
    <div>
      <SlideCard
        id="resend-tx"
        open={!!reSendType}
        onClose={() => onCloseCard({restSendStatus: true})}
        height="h-[552px]"
        cardTitle={
          <div className="text-gray-80 font-medium text-base mb-4 ml-3">
            {isSpeedup ? t('speedupTransaction') : t('cancelTransaction')}
          </div>
        }
        cardContent={
          <div id="resend-transaction">
            <Group
              value={gasPriceChoice}
              onChange={e => onChangeGasPriceChoice(e)}
              name="choice"
            >
              <Radio
                value="recommend"
                id="recommend"
                wrapperClassName="w-full rounded px-3 items-center  mb-3 bg-white border border-solid border-primary-10"
              >
                <div className="px-3 flex h-[70px] items-center">
                  <div className="w-12 h-12 bg-primary-4 flex items-center justify-center rounded-lg">
                    <img
                      className="w-auto h-6"
                      src="/images/sail.svg"
                      alt="sail"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-60 text-xs">
                      {t('suggestedGasPrice')}
                    </p>
                    <div className="flex h-7 items-center">
                      <DisplayBalance
                        balance={suggestedGasPrice}
                        initialFontSize={20}
                      />
                      <span>{minUnit}</span>
                    </div>
                  </div>
                </div>
              </Radio>
              <Radio
                value="custom"
                id="custom"
                wrapperClassName="w-full rounded px-3 items-center bg-white border border-solid border-primary-10"
              >
                <div className="flex h-12 items-center pr-0.5">
                  {gasPriceChoice === 'custom' ? (
                    <NumberInput
                      width="w-full"
                      suffix={minUnit}
                      value={gasPrice}
                      onChange={value => onChangeGasPrice(value)}
                      decimals={GWEI_DECIMALS}
                      id="input-gas-price"
                      bordered={false}
                    />
                  ) : (
                    <span className="text-gray-40 text-sm pl-3">
                      {t('customGasPrice')}
                    </span>
                  )}
                </div>
              </Radio>
            </Group>
            <div className="overflow-hidden">
              <div
                className={`transition duration-300 slide-in-down ease-in-out pt-2 ${gasPriceAnimateStyle}`}
              >
                {gasPriceDisplayErr}
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-gray-40 text-sm">
                    <span>{t('gasLimit')}</span>
                    {!showGasLimitInput && <span>:&nbsp;</span>}
                  </span>
                  {!showGasLimitInput && (
                    <DisplayBalance
                      balance={lastGasLimit}
                      decimals={1}
                      initialFontSize={14}
                      className="!text-gray-40 !font-normal"
                    />
                  )}
                </div>
                {!showGasLimitInput && (
                  <EditOutlined
                    className={'ml-2 w-4 h-4 cursor-pointer text-primary'}
                    id="show-gas-limit"
                    onClick={() => setShowGasLimitInput(true)}
                  />
                )}
              </div>

              {showGasLimitInput && (
                <NumberInput
                  width="w-full"
                  value={gasLimit}
                  errorMessage={gasLimitErr}
                  onChange={value => onChangeGasLimit(value)}
                  containerClassName="mt-2"
                  id="input-gas-limit"
                />
              )}
            </div>
            <GasFee
              estimateRst={estimateRst}
              titleDes={t('spend')}
              goEdit={false}
              showDrip={false}
              titleClassName="!mb-1 !mt-4"
              contentClassName="!bg-gray-0"
            />

            <div className="overflow-hidden">
              <div
                className={`transition duration-300 slide-in-down ease-in-out pt-2 ${balanceHwAnimateStyle}`}
              >
                {balanceHwDisplayErr}
              </div>
            </div>
          </div>
        }
        cardFooter={
          <div>
            <div className="bg-warning-10 text-warning px-3 py-2 text-xs">
              {isSpeedup ? t('speedupTxDes') : t('cancelTxDes')}
            </div>
            <div className="flex mt-3">
              <Button
                className="flex flex-1 mr-3"
                variant="outlined"
                key="cancel"
                id="cancel-btn"
                onClick={onClose}
              >
                {t('cancel')}
              </Button>
              <Button
                className="flex flex-1"
                key="confirm"
                id="confirm-btn"
                disabled={!canResend}
                onClick={onResend}
              >
                {t('submit')}
              </Button>
            </div>
          </div>
        }
      />
      {sendStatus && sendStatus !== TX_STATUS.HW_SUCCESS && (
        <TransactionResult
          status={sendStatus}
          sendError={sendError}
          onClose={onCloseTransactionResult}
        />
      )}

      {executedTxResultStatus && (
        <ExecutedTransaction
          open={executedTxResultStatus}
          onClose={() => setExecutedTxResultStatus(false)}
        />
      )}
    </div>
  )
}

ResendTransaction.propTypes = {
  reSendType: PropTypes.string.isRequired,
  reSendTxStatus: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  transactionRecord: PropTypes.object.isRequired,
  refreshHistoryData: PropTypes.func.isRequired,
}
export default ResendTransaction
