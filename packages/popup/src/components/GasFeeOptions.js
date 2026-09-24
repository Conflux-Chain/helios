import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Popover from '@fluent-wallet/component-popover'
import {ExclamationCircleFilled} from '@fluent-wallet/component-icons'
import {
  convertDataToValue,
  GWEI_DECIMALS,
  toThousands,
  convertDecimal,
} from '@fluent-wallet/data-format'
import {addUnitForValue} from '../utils'

const GasFeeOption = ({
  selected,
  level,
  onClick,
  data,
  uses1559Fees = true,
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
                uses1559Fees ? maxFeePerGas : gasPrice,
                isCfxChain,
              )
            : t('edit')}
        </span>
        {level !== 'advanced' && uses1559Fees && (
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

GasFeeOption.propTypes = {
  selected: PropTypes.bool,
  level: PropTypes.string,
  onClick: PropTypes.func,
  uses1559Fees: PropTypes.bool,
  isCfxChain: PropTypes.bool,
  data: PropTypes.object,
}
function GasFeeOptions({
  uses1559Fees,
  showFeeLevels = uses1559Fees,
  gasInfoEip1559,
  gasLimit,
  suggestedGasPrice,
  selectedGasLevel,
  advancedGasSetting,
  isCfxChain,
  onSelectGasLevel,
  onEditAdvancedFees,
}) {
  const {t} = useTranslation()
  const gasLevels = showFeeLevels ? ['high', 'medium', 'low'] : ['medium']

  return (
    <div className="bg-gray-4 px-2 pt-2 flex flex-col border border-[#f7f8fA] rounded w-full">
      <div className="text-gray-40 flex justify-between mb-2 font-medium">
        <span>{t('gasOption')}</span>
        <span>{uses1559Fees ? t('maxFeePerGas') : t('gasPrice')}</span>
      </div>

      {gasLevels.map(level => (
        <GasFeeOption
          key={level}
          level={showFeeLevels ? level : 'suggested'}
          data={
            showFeeLevels
              ? {
                  maxFeePerGas: gasInfoEip1559?.[level]?.suggestedMaxFeePerGas,
                  maxPriorityFeePerGas:
                    gasInfoEip1559?.[level]?.suggestedMaxPriorityFeePerGas,
                  gasLimit: convertDataToValue(gasLimit),
                  baseFee: gasInfoEip1559?.estimatedBaseFee,
                }
              : {
                  gasPrice: convertDataToValue(
                    suggestedGasPrice,
                    GWEI_DECIMALS,
                  ),
                }
          }
          uses1559Fees={showFeeLevels}
          isCfxChain={isCfxChain}
          selected={selectedGasLevel === level}
          onClick={() => onSelectGasLevel(level)}
        />
      ))}

      <GasFeeOption
        level="advanced"
        data={{
          maxFeePerGas: convertDecimal(
            advancedGasSetting?.maxFeePerGas,
            'divide',
            GWEI_DECIMALS,
          ),
          maxPriorityFeePerGas: convertDecimal(
            advancedGasSetting?.maxPriorityFeePerGas,
            'divide',
            GWEI_DECIMALS,
          ),
          gasLimit: advancedGasSetting?.gasLimit,
          gasPrice: convertDecimal(
            advancedGasSetting?.gasPrice,
            'divide',
            GWEI_DECIMALS,
          ),
          baseFee: gasInfoEip1559?.estimatedBaseFee,
          gasLevel: advancedGasSetting?.gasLevel,
        }}
        uses1559Fees={uses1559Fees}
        isCfxChain={isCfxChain}
        selected={selectedGasLevel === 'advanced'}
        onClick={onEditAdvancedFees}
      />
    </div>
  )
}

GasFeeOptions.propTypes = {
  uses1559Fees: PropTypes.bool,
  showFeeLevels: PropTypes.bool,
  gasInfoEip1559: PropTypes.object,
  gasLimit: PropTypes.string,
  suggestedGasPrice: PropTypes.string,
  selectedGasLevel: PropTypes.string,
  advancedGasSetting: PropTypes.object,
  isCfxChain: PropTypes.bool,
  onSelectGasLevel: PropTypes.func.isRequired,
  onEditAdvancedFees: PropTypes.func.isRequired,
}

export default GasFeeOptions
