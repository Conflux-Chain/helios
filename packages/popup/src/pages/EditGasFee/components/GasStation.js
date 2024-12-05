import PropTypes from 'prop-types'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Popover from '@fluent-wallet/component-popover'
import {ExclamationCircleFilled} from '@fluent-wallet/component-icons'
import {
  convertDataToValue,
  GWEI_DECIMALS,
  toThousands,
  convertDecimal,
} from '@fluent-wallet/data-format'
import {useCurrentTxStore} from '../../../hooks'
import {addUnitForValue} from '../../../utils'
import {ROUTES} from '../../../constants'

const {ADVANCED_GAS} = ROUTES

const GasStationItem = ({
  selected,
  level,
  onClick,
  data,
  isTxTreatedAsEIP1559 = true,
  isCfxChain = false,
}) => {
  const {t} = useTranslation()
  const {
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit,
    baseFee,
    gasPrice,
    gasLevel,
  } = data
  return (
    <div
      className={`w-full h-10 px-3 mb-3 flex cursor-pointer items-center justify-between rounded hover:bg-primary-10 text-xs border ${
        selected ? 'border-primary bg-primary-10' : 'border-gray-10 bg-gray-0'
      }`}
      aria-hidden="true"
      onClick={() => onClick && onClick(level)}
    >
      <span className="text-gray-60">{t(level)}</span>
      <div className="flex items-center">
        <span className="text-primary">
          {gasLevel === 'advanced' || level !== 'advanced'
            ? addUnitForValue(
                isTxTreatedAsEIP1559 ? maxFeePerGas : gasPrice,
                isCfxChain,
              )
            : t('edit')}
        </span>
        {level !== 'advanced' && isTxTreatedAsEIP1559 && (
          <Popover
            content={
              <div className="flex flex-col text-xs w-50">
                <span className="text-primary flex justify-center mb-2">
                  {t('gasFeeDetail')}
                </span>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-60">{t('maxFee')}</span>
                  <span className="text-gray-80 font-medium">
                    {addUnitForValue(maxFeePerGas)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-60">{t('baseFee')}</span>
                  <span className="text-gray-80 font-medium">
                    {addUnitForValue(baseFee)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-60">{t('priorityFee')}</span>
                  <span className="text-gray-80 font-medium">
                    {addUnitForValue(maxPriorityFeePerGas)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-60">{t('gasLimit')}</span>
                  <span className="text-gray-80 font-medium">
                    {toThousands(gasLimit || '0')}
                  </span>
                </div>
                <span></span>
              </div>
            }
            placement="bottom"
          >
            <ExclamationCircleFilled className="text-primary ml-1 w-[14px] h-[14px]" />
          </Popover>
        )}
      </div>
    </div>
  )
}

GasStationItem.propTypes = {
  selected: PropTypes.bool,
  level: PropTypes.string,
  onClick: PropTypes.func,
  isTxTreatedAsEIP1559: PropTypes.bool,
  isCfxChain: PropTypes.bool,
  data: PropTypes.object,
}

function GasStation({
  isTxTreatedAsEIP1559,
  isHistoryTx,
  gasInfoEip1559,
  selectedGasLevel,
  setSelectedGasLevel,
  onClickGasStationItem,
  suggestedGasPrice,
  isCfxChain,
  estimateGasLimit,
  resendType,
}) {
  const {t} = useTranslation()
  const history = useHistory()
  const {advancedGasSetting, clearAdvancedGasSetting} = useCurrentTxStore()

  const gasArray = ['high', 'medium', 'low']

  return (
    <div className="bg-gray-4 px-2 pt-2 flex flex-col border border-[#f7f8fA] rounded w-full">
      <div className="text-gray-40 flex justify-between mb-2 font-medium">
        <span>{t('gasOption')}</span>
        <span>{isTxTreatedAsEIP1559 ? t('maxFeePerGas') : t('gasPrice')}</span>
      </div>
      {isTxTreatedAsEIP1559 &&
        !resendType &&
        gasArray.map((level, index) => (
          <GasStationItem
            key={index}
            level={level}
            data={{
              maxFeePerGas: gasInfoEip1559?.[level]?.suggestedMaxFeePerGas,
              maxPriorityFeePerGas:
                gasInfoEip1559?.[level]?.suggestedMaxPriorityFeePerGas,
              gasLimit: convertDataToValue(estimateGasLimit),
              baseFee: gasInfoEip1559?.['estimatedBaseFee'],
            }}
            isCfxChain={isCfxChain}
            isTxTreatedAsEIP1559={true}
            selected={selectedGasLevel === level}
            onClick={level => {
              setSelectedGasLevel(level)
              clearAdvancedGasSetting()
              onClickGasStationItem?.()
            }}
          />
        ))}
      {(!isTxTreatedAsEIP1559 || !!resendType) && (
        <GasStationItem
          level="suggested"
          data={{
            gasPrice: convertDataToValue(suggestedGasPrice, GWEI_DECIMALS),
          }}
          isTxTreatedAsEIP1559={false}
          isCfxChain={isCfxChain}
          selected={selectedGasLevel === 'medium'}
          onClick={() => {
            setSelectedGasLevel('medium')
            clearAdvancedGasSetting()
            onClickGasStationItem?.()
          }}
        />
      )}
      <GasStationItem
        level="advanced"
        data={{
          maxFeePerGas: convertDecimal(
            advancedGasSetting?.['maxFeePerGas'],
            'divide',
            GWEI_DECIMALS,
          ),
          maxPriorityFeePerGas: convertDecimal(
            advancedGasSetting?.['maxPriorityFeePerGas'],
            'divide',
            GWEI_DECIMALS,
          ),
          gasLimit: advancedGasSetting?.['gasLimit'],
          gasPrice: convertDecimal(
            advancedGasSetting?.['gasPrice'],
            'divide',
            GWEI_DECIMALS,
          ),
          baseFee: gasInfoEip1559?.['estimatedBaseFee'],
          gasLevel: advancedGasSetting?.['gasLevel'],
        }}
        isCfxChain={isCfxChain}
        isTxTreatedAsEIP1559={isTxTreatedAsEIP1559}
        selected={selectedGasLevel === 'advanced'}
        onClick={() => {
          if (
            (isTxTreatedAsEIP1559 &&
              selectedGasLevel !== 'advanced' &&
              !gasInfoEip1559?.[selectedGasLevel]) ||
            (!isTxTreatedAsEIP1559 && !suggestedGasPrice)
          )
            return
          const {suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas} =
            gasInfoEip1559?.[selectedGasLevel] || {}
          history.push({
            pathname: ADVANCED_GAS,
            search: `?isHistoryTx=${isHistoryTx}&${
              isTxTreatedAsEIP1559
                ? `suggestedMaxFeePerGas=${suggestedMaxFeePerGas}&suggestedMaxPriorityFeePerGas=${suggestedMaxPriorityFeePerGas}&selectedGasLevel=${selectedGasLevel}`
                : ''
            }${
              !isTxTreatedAsEIP1559
                ? 'suggestedGasPrice=' + suggestedGasPrice
                : ''
            }`,
          })
        }}
      />
    </div>
  )
}

GasStation.propTypes = {
  isTxTreatedAsEIP1559: PropTypes.bool,
  isHistoryTx: PropTypes.bool,
  gasInfoEip1559: PropTypes.object,
  selectedGasLevel: PropTypes.string,
  setSelectedGasLevel: PropTypes.func,
  onClickGasStationItem: PropTypes.func,
  suggestedGasPrice: PropTypes.string,
  isCfxChain: PropTypes.bool,
  estimateGasLimit: PropTypes.string,
  resendType: PropTypes.string,
}

export default GasStation
