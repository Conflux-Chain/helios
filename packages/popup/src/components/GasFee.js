import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Link from '@fluent-wallet/component-link'
import {Big, fromDripToCfx} from '@fluent-wallet/data-format'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {CompWithLabel, DisplayBalance, CustomTag} from '../components'
import {useNetworkTypeIsCfx} from '../hooks/useApi'
import {ROUTES} from '../constants'
const {EDIT_GAS_FEE} = ROUTES

function GasFee({
  gasLimit = new Big(1000000000000),
  gasPrice = '1',
  storageCollateralized = new Big(1000000000000),
  payCollateral = false,
  payTxFee = true,
}) {
  const {t} = useTranslation()
  const history = useHistory()
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const isBePayed = !payCollateral || !payTxFee
  const isBeAllPayed = !payCollateral && !payTxFee
  const gasFee = new Big(fromDripToCfx(gasLimit.toString(10))).times(gasPrice)
  const storageFee = new Big(storageCollateralized).div(1024)
  const realPayedFee = isBeAllPayed ? '0' : !payCollateral ? gasFee : storageFee
  const allFee = new Big(gasFee).plus(storageFee)

  const label = (
    <span className="flex items-center justify-between w-full">
      {t('gasFee')}
      <span className="flex items-center">
        <Link onClick={() => history.push(EDIT_GAS_FEE)}>
          {t('edit')}
          <RightOutlined className="w-3 h-3 text-primary ml-1" />
        </Link>
      </span>
    </span>
  )
  return (
    <CompWithLabel label={label}>
      <div className="flex flex-col bg-gray-4 border-gray-10 rounded px-2 py-3 relative">
        <DisplayBalance
          balance={realPayedFee.toString()}
          maxWidth={234}
          maxWidthStyle="max-w-[234px]"
          className="text-base mb-0.5"
          symbol="CFX"
          initialFontSize={16}
        />
        <DisplayBalance
          balance={allFee.toString()}
          maxWidth={300}
          maxWidthStyle="max-w-[300px]"
          className="!text-gray-40 line-through !font-normal mb-0.5"
          symbol="CFX"
        />
        <span className="text-xs text-gray-60">{`${gasPrice} ${
          networkTypeIsCfx ? 'Drip' : 'Gwei'
        }`}</span>
        {isBePayed && (
          <CustomTag
            width="w-15"
            textColor="text-white"
            backgroundColor="bg-[#44d7b6]"
            className="absolute right-0 top-0"
          >
            <span className="text-2xs text-white">{t('sponsored')}</span>
          </CustomTag>
        )}
      </div>
    </CompWithLabel>
  )
}

GasFee.propTypes = {
  gasPrice: PropTypes.string,
  gasLimit: PropTypes.object,
  storageCollateralized: PropTypes.object,
  payCollateral: PropTypes.bool,
  payTxFee: PropTypes.bool,
}

export default GasFee
