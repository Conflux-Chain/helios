import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {NumberInput, CompWithLabel} from '../../../components'
import {GWEI_DECIMALS} from '@fluent-wallet/data-format'
// import {addUnitForValue} from '../../../utils'

function CustomGasPrice({
  // gasInfoEip1559,
  isCfxChain,
  isTxTreatedAsEIP1559,
  inputGasPrice,
  gasPriceErr,
  onChangeGasPrice,
  inputMaxFeePerGas,
  onChangeMaxFeePerGas,
  inputMaxPriorityFeePerGas,
  maxPriorityFeePerGasErr,
  onChangeMaxPriorityFeePerGas,
}) {
  const {t} = useTranslation()
  // const {
  //   historicalBaseFeeRange,
  //   historicalPriorityFeeRange,
  //   low,
  //   latestPriorityFeeRange,
  // } = gasInfoEip1559 || {}
  return (
    <div className="p-2 flex flex-col rounded bg-gray-10 mb-4">
      {isTxTreatedAsEIP1559 && (
        <>
          <CompWithLabel
            label={`${t('maxFeePerGas')}(${isCfxChain ? 'GDrip' : 'GWei'})`}
            className="!mt-0"
          >
            <NumberInput
              id="maxFeePerGas"
              width="w-full"
              decimals={GWEI_DECIMALS}
              value={inputMaxFeePerGas}
              onChange={value => onChangeMaxFeePerGas(value)}
            />
          </CompWithLabel>
          {/* {historicalBaseFeeRange && (
            <div className="flex justify-between text-primary text-xs mt-2">
              <span>
                {addUnitForValue(
                  `${t('current')}${low?.suggestedMaxFeePerGas}`,
                  isCfxChain,
                )}
              </span>
              <span>
                {addUnitForValue(
                  `${t('twelveHour')}${historicalBaseFeeRange?.[0] || '0'} ~ ${
                    historicalBaseFeeRange?.[1] || '0'
                  }`,
                  isCfxChain,
                )}
              </span>
            </div>
          )} */}
          <CompWithLabel
            label={`${t('maxPriorityFeePerGas')}(${
              isCfxChain ? 'GDrip' : 'GWei'
            })`}
            className="!mt-6"
          >
            <NumberInput
              id="maxPriorityFeePerGas"
              width="w-full"
              decimals={GWEI_DECIMALS}
              value={inputMaxPriorityFeePerGas}
              errorMessage={maxPriorityFeePerGasErr}
              onChange={value => onChangeMaxPriorityFeePerGas(value)}
            />
          </CompWithLabel>
          {/* {latestPriorityFeeRange && historicalPriorityFeeRange && (
              <div className="flex justify-between text-primary text-xs mt-2">
                <span>
                  {addUnitForValue(
                    `${t('twelveHour')}${latestPriorityFeeRange?.[0]} ~ ${
                      latestPriorityFeeRange?.[1]
                    }`,
                    isCfxChain,
                  )}
                </span>
                <span>
                  {addUnitForValue(
                    `${t('twelveHour')}${historicalPriorityFeeRange?.[0]} ~ ${
                      historicalPriorityFeeRange?.[1]
                    }`,
                    isCfxChain,
                  )}
                </span>
              </div>
            )} */}
        </>
      )}
      {!isTxTreatedAsEIP1559 && (
        <CompWithLabel
          label={`${t('gasPrice')}(${isCfxChain ? 'GDrip' : 'GWei'})`}
          className="!mt-0"
        >
          <NumberInput
            id="gasPrice"
            width="w-full"
            decimals={GWEI_DECIMALS}
            value={inputGasPrice}
            errorMessage={gasPriceErr}
            onChange={value => onChangeGasPrice(value)}
          />
        </CompWithLabel>
      )}
    </div>
  )
}

CustomGasPrice.propTypes = {
  //  gasInfoEip1559: PropTypes.object,
  isCfxChain: PropTypes.bool,
  isTxTreatedAsEIP1559: PropTypes.bool,
  inputGasPrice: PropTypes.string,
  gasPriceErr: PropTypes.string,
  onChangeGasPrice: PropTypes.func,
  inputMaxFeePerGas: PropTypes.string,
  onChangeMaxFeePerGas: PropTypes.func,
  inputMaxPriorityFeePerGas: PropTypes.string,
  maxPriorityFeePerGasErr: PropTypes.string,
  onChangeMaxPriorityFeePerGas: PropTypes.func,
}

export default CustomGasPrice
