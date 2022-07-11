import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {
  Big,
  formatDecimalToHex,
  formatHexToDecimal,
  convertDecimal,
  GWEI_DECIMALS,
} from '@fluent-wallet/data-format'
import {TitleNav, GasCost} from '../../components'
import {useNetworkTypeIsCfx, useCfxMaxGasLimit} from '../../hooks/useApi'
import {
  useCurrentTxParams,
  useEstimateTx,
  useDappParams,
  useQuery,
  useIsTxTreatedAsEIP1559,
} from '../../hooks'
import {getPageType} from '../../utils'
import {CustomGasPrice, CustomOptional} from './components'

function AdvancedGas() {
  const {t} = useTranslation()
  const {selectedGasLevel, suggestedGasPrice} = useQuery()
  const history = useHistory()

  const [inputGasPrice, setInputGasPrice] = useState('')
  const [inputMaxFeePerGas, setInputMaxFeePerGas] = useState('')
  const [inputMaxPriorityFeePerGas, setInputMaxPriorityFeePerGas] = useState('')
  const [inputGasLimit, setInputGasLimit] = useState('')
  const [inputNonce, setInputNonce] = useState('')
  const [gasPriceErr, setGasPriceErr] = useState('')
  const [maxPriorityFeePerGasErr, setMaxPriorityFeePerGasErr] = useState('')
  const [gasLimitErr, setGasLimitErr] = useState('')
  const [nonceErr, setNonceErr] = useState('')

  const {
    gasLimit,
    nonce,
    storageLimit,
    setAdvancedGasSetting,
    tx: txParams,
  } = useCurrentTxParams()

  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const cfxMaxGasLimit = useCfxMaxGasLimit(networkTypeIsCfx)

  const isDapp = getPageType() === 'notification'
  const tx = useDappParams()
  const originParams = !isDapp ? {...txParams} : {...tx}

  const isTxTreatedAsEIP1559 = useIsTxTreatedAsEIP1559(originParams?.type)

  const params = {
    ...originParams,
    gasPrice: formatDecimalToHex(
      convertDecimal(inputGasPrice, 'multiply', GWEI_DECIMALS),
    ),
    maxFeePerGas: formatDecimalToHex(
      convertDecimal(inputMaxFeePerGas, 'multiply', GWEI_DECIMALS),
    ),
    inputMaxPriorityFeePerGas: formatDecimalToHex(
      convertDecimal(inputMaxPriorityFeePerGas, 'multiply', GWEI_DECIMALS),
    ),
    gas: formatDecimalToHex(inputGasLimit),
    nonce: formatDecimalToHex(inputNonce),
  }
  if (!params.maxFeePerGas) delete params.maxFeePerGas
  if (!params.inputMaxPriorityFeePerGas) delete params.inputMaxPriorityFeePerGas
  if (!params.gasPrice) delete params.gasPrice
  const estimateRst = useEstimateTx(params) || {}
  const {gasUsed, gasInfoEip1559 = {}} = estimateRst
  const {suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas} =
    gasInfoEip1559?.[selectedGasLevel] || {}

  useEffect(() => {
    setInputGasLimit(gasLimit)
    setInputNonce(nonce)
    !isTxTreatedAsEIP1559 &&
      setInputGasPrice(
        convertDecimal(suggestedGasPrice, 'divide', GWEI_DECIMALS),
      )
    isTxTreatedAsEIP1559 &&
      setInputGasPrice(
        convertDecimal(suggestedMaxFeePerGas, 'divide', GWEI_DECIMALS),
      )
    isTxTreatedAsEIP1559 &&
      setInputGasPrice(
        convertDecimal(suggestedMaxPriorityFeePerGas, 'divide', GWEI_DECIMALS),
      )
  }, [
    gasLimit,
    suggestedGasPrice,
    isTxTreatedAsEIP1559,
    suggestedMaxFeePerGas,
    suggestedMaxPriorityFeePerGas,
    nonce,
  ])

  const onChangeGasPrice = gasPrice => {
    setInputGasPrice(gasPrice)
    if (!networkTypeIsCfx) {
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
    if (!nonce || new Big(nonce).gt(0)) {
      setNonceErr('')
    } else {
      setNonceErr(t('nonceErr'))
    }
  }

  const saveGasData = () => {
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
      gasLimit: inputGasLimit || gasLimit,
      nonce: inputNonce || nonce,
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
            gasInfoEip1559={gasInfoEip1559}
            networkTypeIsCfx={networkTypeIsCfx}
            isTxTreatedAsEIP1559={isTxTreatedAsEIP1559}
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
            inputGasLimit={inputGasLimit}
            gasLimitErr={gasLimitErr}
            onChangeGasLimit={onChangeGasLimit}
            inputNonce={inputNonce}
            nonceErr={nonceErr}
            onChangeNonce={onChangeNonce}
            storageLimit={storageLimit}
            nonce={nonce}
            gasLimit={gasLimit}
          />
        </main>
      </div>
      <footer>
        <Button
          className="w-70 mx-auto mb-6"
          id="saveGasFeeBtn"
          onClick={saveGasData}
          disabled={
            !!gasPriceErr ||
            !!nonceErr ||
            !!gasLimitErr ||
            !maxPriorityFeePerGasErr
          }
        >
          {t('save')}
        </Button>
      </footer>
    </div>
  )
}

export default AdvancedGas
