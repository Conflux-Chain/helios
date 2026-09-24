import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {GWEI_DECIMALS} from '@fluent-wallet/data-format'
import NumberInput from './NumberInput'
import CompWithLabel from './CompWithLabel'

function GasPriceFields({
  isCfxChain,
  uses1559Fees,
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
  const unit = isCfxChain ? 'GDrip' : 'GWei'

  return (
    <div className="p-2 flex flex-col rounded bg-gray-10 mb-4">
      {uses1559Fees ? (
        <>
          <CompWithLabel
            label={`${t('maxFeePerGas')}(${unit})`}
            className="!mt-0"
          >
            <NumberInput
              id="maxFeePerGas"
              width="w-full"
              decimals={GWEI_DECIMALS}
              value={inputMaxFeePerGas}
              onChange={onChangeMaxFeePerGas}
            />
          </CompWithLabel>

          <CompWithLabel
            label={`${t('maxPriorityFeePerGas')}(${unit})`}
            className="!mt-6"
          >
            <NumberInput
              id="maxPriorityFeePerGas"
              width="w-full"
              decimals={GWEI_DECIMALS}
              value={inputMaxPriorityFeePerGas}
              errorMessage={maxPriorityFeePerGasErr}
              onChange={onChangeMaxPriorityFeePerGas}
            />
          </CompWithLabel>
        </>
      ) : (
        <CompWithLabel label={`${t('gasPrice')}(${unit})`} className="!mt-0">
          <NumberInput
            id="gasPrice"
            width="w-full"
            decimals={GWEI_DECIMALS}
            value={inputGasPrice}
            errorMessage={gasPriceErr}
            onChange={onChangeGasPrice}
          />
        </CompWithLabel>
      )}
    </div>
  )
}

GasPriceFields.propTypes = {
  isCfxChain: PropTypes.bool,
  uses1559Fees: PropTypes.bool,
  inputGasPrice: PropTypes.string,
  gasPriceErr: PropTypes.string,
  onChangeGasPrice: PropTypes.func,
  inputMaxFeePerGas: PropTypes.string,
  onChangeMaxFeePerGas: PropTypes.func,
  inputMaxPriorityFeePerGas: PropTypes.string,
  maxPriorityFeePerGasErr: PropTypes.string,
  onChangeMaxPriorityFeePerGas: PropTypes.func,
}

export default GasPriceFields
