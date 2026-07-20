import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {
  Big,
  formatHexToDecimal,
  formatDecimalToHex,
  convertDecimal,
  convertValueToData,
  convertDataToValue,
  GWEI_DECIMALS,
} from '@fluent-wallet/data-format'
import {TitleNav, GasCost} from '../../components'
import {
  useIsCfxChain,
  useNetworkTypeIsCfx,
  useCfxMaxGasLimit,
} from '../../hooks/useApi'
import {
  useCurrentTxStore,
  useEstimateTx,
  useDappParams,
  useQuery,
  useUses1559Fees,
} from '../../hooks'
import {getPageType} from '../../utils'
import {CustomGasPrice, CustomOptional} from './components'

function AdvancedGas() {
  const {t} = useTranslation()
  const query = useQuery()
  const selectedGasLevel = query.get('selectedGasLevel')
  const suggestedMaxFeePerGas = query.get('suggestedMaxFeePerGas')
  const suggestedMaxPriorityFeePerGas = query.get(
    'suggestedMaxPriorityFeePerGas',
  )
  const isHistoryTx = JSON.parse(query.get('isHistoryTx'))
  const suggestedGasPrice = query.get('suggestedGasPrice')

  const history = useHistory()

  const [inputGasPrice, setInputGasPrice] = useState('')
  const [inputMaxFeePerGas, setInputMaxFeePerGas] = useState('')
  const [inputMaxPriorityFeePerGas, setInputMaxPriorityFeePerGas] = useState('')
  const [inputGasLimit, setInputGasLimit] = useState('')
  const [gasPriceErr, setGasPriceErr] = useState('')
  const [maxPriorityFeePerGasErr, setMaxPriorityFeePerGasErr] = useState('')
  const [gasLimitErr, setGasLimitErr] = useState('')
  const [nonceErr, setNonceErr] = useState('')

  const {
    gasLimit,
    nonce: suggestedNonce,
    customNonce,
    storageLimit,
    advancedGasSetting,
    setAdvancedGasSetting,
    setCustomNonce,
    tx: txParams,
  } = useCurrentTxStore()
  const [inputNonce, setInputNonce] = useState(isHistoryTx ? '' : customNonce)

  const isCfxChain = useIsCfxChain()
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const cfxMaxGasLimit = useCfxMaxGasLimit(networkTypeIsCfx)

  const isDapp = getPageType() === 'notification'
  const tx = useDappParams()
  const originParams = !isDapp ? {...txParams} : {...tx}

  const uses1559Fees = useUses1559Fees(originParams?.type)
  const params = {
    ...originParams,
    gasPrice: convertValueToData(inputGasPrice, GWEI_DECIMALS),
    maxFeePerGas: inputMaxFeePerGas
      ? convertValueToData(inputMaxFeePerGas, GWEI_DECIMALS)
      : '',
    maxPriorityFeePerGas: inputMaxPriorityFeePerGas
      ? convertValueToData(inputMaxPriorityFeePerGas, GWEI_DECIMALS)
      : '',
    gas: formatDecimalToHex(
      inputGasLimit || advancedGasSetting.gasLimit || gasLimit,
    ),
    nonce: isHistoryTx
      ? originParams.nonce
      : formatDecimalToHex(inputNonce || suggestedNonce),
    storageLimit: formatDecimalToHex(
      advancedGasSetting.storageLimit || storageLimit,
    ),
  }
  if (!params.maxFeePerGas) delete params.maxFeePerGas
  if (!params.maxPriorityFeePerGas) delete params.maxPriorityFeePerGas
  if (!params.gasPrice) delete params.gasPrice
  if (!params.storageLimit) delete params.storageLimit
  if (!params.nonce) delete params.nonce

  const estimateRst = useEstimateTx(params) || {}
  const {
    gasUsed,
    gasLimit: estimateGasLimit,
    storageCollateralized: estimateStorageLimit,
  } = estimateRst

  if (!params.gas) params.gas = estimateGasLimit

  const {
    gasPrice: advancedGasPrice,
    maxFeePerGas: advancedMaxFeePerGas,
    maxPriorityFeePerGas: advancedMaxPriorityFeePerGas,
  } = advancedGasSetting

  useEffect(() => {
    const wrapSuggestedMaxFeePerGas =
      uses1559Fees && !isNaN(Number(suggestedMaxFeePerGas))
        ? new Big(suggestedMaxFeePerGas).round(9).toString(10)
        : ''
    const wrapSuggestedMaxPriorityFeePerGas =
      uses1559Fees && !isNaN(Number(suggestedMaxPriorityFeePerGas))
        ? new Big(suggestedMaxPriorityFeePerGas).round(9).toString(10)
        : ''
    !uses1559Fees &&
      !inputGasPrice &&
      setInputGasPrice(
        advancedGasPrice
          ? convertDecimal(advancedGasPrice, 'divide', GWEI_DECIMALS)
          : convertDataToValue(suggestedGasPrice, GWEI_DECIMALS),
      )
    // gas station unit is GWei
    uses1559Fees &&
      !inputMaxFeePerGas &&
      setInputMaxFeePerGas(
        selectedGasLevel === 'advanced'
          ? convertDecimal(advancedMaxFeePerGas, 'divide', GWEI_DECIMALS)
          : wrapSuggestedMaxFeePerGas,
      )
    uses1559Fees &&
      !inputMaxPriorityFeePerGas &&
      setInputMaxPriorityFeePerGas(
        selectedGasLevel === 'advanced'
          ? convertDecimal(
              advancedMaxPriorityFeePerGas,
              'divide',
              GWEI_DECIMALS,
            )
          : wrapSuggestedMaxPriorityFeePerGas,
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedGasLevel,
    uses1559Fees,
    suggestedGasPrice,
    suggestedMaxFeePerGas,
    suggestedMaxPriorityFeePerGas,
    advancedGasPrice,
    advancedMaxPriorityFeePerGas,
    advancedMaxFeePerGas,
  ])

  const onChangeGasPrice = gasPrice => {
    setInputGasPrice(gasPrice)
    if (!isCfxChain) {
      if (new Big(gasPrice || '0').times('1e9').gt(0)) {
        setGasPriceErr('')
      } else {
        setGasPriceErr(
          t('gasPriceErr', {
            amount: 0.000000001,
            unit: 'GWei',
          }),
        )
      }
    } else {
      if (new Big(gasPrice || '0').gt(0)) {
        setGasPriceErr('')
      } else {
        setGasPriceErr(
          t('gasPriceErr', {
            amount: 1,
            unit: 'GDrip',
          }),
        )
      }
    }
  }

  const onChangeMaxFeePerGas = maxFeePerGas => {
    setInputMaxFeePerGas(maxFeePerGas)
    if (
      !maxPriorityFeePerGasErr &&
      new Big(inputMaxPriorityFeePerGas).gt(maxFeePerGas || '0')
    ) {
      setMaxPriorityFeePerGasErr(t('maxPriorityFeePerGasHighErr'))
    } else if (
      maxPriorityFeePerGasErr === t('maxPriorityFeePerGasHighErr') &&
      new Big(inputMaxPriorityFeePerGas).lte(maxFeePerGas || '0')
    ) {
      setMaxPriorityFeePerGasErr('')
    }
  }

  const onChangeMaxPriorityFeePerGas = maxPriorityFeePerGas => {
    setInputMaxPriorityFeePerGas(maxPriorityFeePerGas)
    if (new Big(maxPriorityFeePerGas || '0').times('1e9').lte(0)) {
      setMaxPriorityFeePerGasErr(
        t('maxPriorityFeePerGasLowErr', {
          amount: 0.000000001,
          unit: 'GWei',
        }),
      )
    } else if (new Big(maxPriorityFeePerGas).gt(inputMaxFeePerGas || '0')) {
      setMaxPriorityFeePerGasErr(t('maxPriorityFeePerGasHighErr'))
    } else {
      setMaxPriorityFeePerGasErr('')
    }
  }

  const onChangeGasLimit = gasLimit => {
    setInputGasLimit(gasLimit)
    if (!gasLimit) {
      setGasLimitErr('')
    } else if (new Big(gasLimit).lt(formatHexToDecimal(gasUsed || '21000'))) {
      setGasLimitErr(
        t('gasLimitMinErr', {
          gasUsed: formatHexToDecimal(gasUsed || '21000'),
        }),
      )
    } else if (
      cfxMaxGasLimit &&
      new Big(gasLimit).gt(formatHexToDecimal(cfxMaxGasLimit))
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

  const onChangeNonce = nonce => {
    setInputNonce(nonce)
    if (!nonce || new Big(nonce).gte(0)) {
      setNonceErr('')
    } else {
      setNonceErr(t('nonceErr'))
    }
  }

  const saveGasData = () => {
    if (!isHistoryTx) setCustomNonce(inputNonce)
    setAdvancedGasSetting({
      gasPrice: convertDecimal(inputGasPrice, 'multiply', GWEI_DECIMALS),
      maxFeePerGas: convertDecimal(
        inputMaxFeePerGas,
        'multiply',
        GWEI_DECIMALS,
      ),
      maxPriorityFeePerGas: convertDecimal(
        inputMaxPriorityFeePerGas,
        'multiply',
        GWEI_DECIMALS,
      ),
      gasLimit:
        inputGasLimit ||
        advancedGasSetting.gasLimit ||
        gasLimit ||
        formatHexToDecimal(estimateGasLimit),
      nonce: isHistoryTx
        ? formatHexToDecimal(originParams.nonce)
        : inputNonce || suggestedNonce,
      storageLimit:
        advancedGasSetting.storageLimit ||
        storageLimit ||
        formatHexToDecimal(estimateStorageLimit),
      gasLevel: 'advanced',
    })
    history.goBack()
  }

  return (
    <div
      id="editGasFeeContainer"
      className="h-full w-full flex flex-col bg-blue-circles bg-no-repeat bg-0"
    >
      <div className="flex-1">
        <TitleNav title={t('advanced')} />
        <main className="mt-3 px-4">
          <GasCost sendParams={params} networkTypeIsCfx={networkTypeIsCfx} />
          <CustomGasPrice
            isCfxChain={isCfxChain}
            uses1559Fees={uses1559Fees}
            inputGasPrice={inputGasPrice}
            gasPriceErr={gasPriceErr}
            onChangeGasPrice={onChangeGasPrice}
            inputMaxFeePerGas={inputMaxFeePerGas}
            onChangeMaxFeePerGas={onChangeMaxFeePerGas}
            inputMaxPriorityFeePerGas={inputMaxPriorityFeePerGas}
            maxPriorityFeePerGasErr={maxPriorityFeePerGasErr}
            onChangeMaxPriorityFeePerGas={onChangeMaxPriorityFeePerGas}
          />
          <CustomOptional
            networkTypeIsCfx={networkTypeIsCfx}
            isHistoryTx={isHistoryTx}
            inputGasLimit={inputGasLimit}
            gasLimitErr={gasLimitErr}
            onChangeGasLimit={onChangeGasLimit}
            inputNonce={inputNonce}
            nonceErr={nonceErr}
            onChangeNonce={onChangeNonce}
            storageLimit={
              advancedGasSetting.storageLimit ||
              storageLimit ||
              formatHexToDecimal(estimateStorageLimit)
            }
            nonce={inputNonce || suggestedNonce}
            gasLimit={
              advancedGasSetting.gasLimit ||
              gasLimit ||
              formatHexToDecimal(estimateGasLimit)
            }
          />
        </main>
      </div>
      <footer className="px-4">
        <Button
          className="w-full mx-auto mb-6"
          id="saveAdvancedGasFeeBtn"
          onClick={saveGasData}
          disabled={
            !!gasPriceErr ||
            !!nonceErr ||
            !!gasLimitErr ||
            !!maxPriorityFeePerGasErr
          }
        >
          {t('save')}
        </Button>
      </footer>
    </div>
  )
}

export default AdvancedGas
