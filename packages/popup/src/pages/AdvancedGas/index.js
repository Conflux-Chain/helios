import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {
  Big,
  convertDecimal,
  formatHexToDecimal,
  GWEI_DECIMALS,
} from '@fluent-wallet/data-format'
import TitleNav from '../../components/TitleNav'
import AdvancedGasEditor from '../../components/AdvancedGasEditor'
import {NETWORK_TYPE} from '../../constants'
import {useCurrentAddress, useCfxMaxGasLimit} from '../../hooks/useApi'
import {
  useCurrentTxStore,
  useDappParams,
  useQuery,
  useUses1559Fees,
} from '../../hooks'
import PageLoading from '../../hooks/useLoading/PageLoading'
import {getPageType} from '../../utils'

function AdvancedGas() {
  const {t} = useTranslation()
  const history = useHistory()
  const query = useQuery()
  const selectedGasLevel = query.get('selectedGasLevel')
  const isHistoryTx = JSON.parse(query.get('isHistoryTx'))

  const {
    data: {network},
  } = useCurrentAddress()

  const {
    gasLimit,
    nonce: suggestedNonce,
    customNonce,
    storageLimit,
    advancedGasSetting,
    setAdvancedGasSetting,
    setCustomNonce,
    tx,
  } = useCurrentTxStore()

  const dappTransaction = useDappParams()
  const transaction = getPageType() === 'notification' ? dappTransaction : tx

  const uses1559Fees = useUses1559Fees(transaction?.type)
  const maxGasLimit = useCfxMaxGasLimit(network.type === NETWORK_TYPE.CFX)

  if (!network.name || !transaction?.from || uses1559Fees === undefined) {
    return <PageLoading />
  }

  const initialValues = {
    gasPrice:
      advancedGasSetting.gasPrice ||
      formatHexToDecimal(query.get('suggestedGasPrice')) ||
      '',
    maxFeePerGas: advancedGasSetting.maxFeePerGas,
    maxPriorityFeePerGas: advancedGasSetting.maxPriorityFeePerGas,
    gasLimit: advancedGasSetting.gasLimit || gasLimit,
    storageLimit: advancedGasSetting.storageLimit || storageLimit,
    nonce: isHistoryTx ? '' : customNonce,
  }

  if (uses1559Fees && selectedGasLevel !== 'advanced') {
    initialValues.maxFeePerGas = convertDecimal(
      new Big(query.get('suggestedMaxFeePerGas')).round(9).toString(10),
      'multiply',
      GWEI_DECIMALS,
    )
    initialValues.maxPriorityFeePerGas = convertDecimal(
      new Big(query.get('suggestedMaxPriorityFeePerGas')).round(9).toString(10),
      'multiply',
      GWEI_DECIMALS,
    )
  }

  const handleSave = settings => {
    if (!isHistoryTx) {
      setCustomNonce(settings.nonce)
    }

    setAdvancedGasSetting({
      ...settings,
      nonce: settings.nonce || suggestedNonce,
      gasLevel: 'advanced',
    })

    history.goBack()
  }

  return (
    <div
      id="editGasFeeContainer"
      className="flex h-full w-full flex-col bg-blue-circles bg-no-repeat bg-0"
    >
      <div className="shrink-0">
        <TitleNav title={t('advanced')} />
      </div>

      <AdvancedGasEditor
        transaction={transaction}
        network={network}
        initialValues={initialValues}
        uses1559Fees={uses1559Fees}
        suggestedNonce={suggestedNonce}
        maxGasLimit={formatHexToDecimal(maxGasLimit)}
        canEditNonce={!isHistoryTx}
        onSave={handleSave}
      />
    </div>
  )
}

export default AdvancedGas
