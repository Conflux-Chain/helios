import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Link from '@fluent-wallet/component-link'
import {CFX_DECIMALS, ETH_DECIMALS} from '@fluent-wallet/data-format'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {DisplayBalance, CustomTag} from '../components'
import {useNetworkTypeIsCfx} from '../hooks/useApi'
import useGlobalStore from '../stores'
import {ROUTES} from '../constants'
const {EDIT_GAS_FEE} = ROUTES

function GasFee({estimateRst}) {
  const {gasPrice: inputGasPrice} = useGlobalStore()
  const {t} = useTranslation()
  const history = useHistory()
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const symbol = networkTypeIsCfx ? 'CFX' : 'ETH'
  const decimals = networkTypeIsCfx ? CFX_DECIMALS : ETH_DECIMALS
  const {willPayCollateral, willPayTxFee} = estimateRst
  const {storageFeeDrip, gasFeeDrip, txFeeDrip} = estimateRst?.customData || {}
  const gasPrice = inputGasPrice
  const isBePayed = willPayCollateral === false || willPayTxFee === false
  const isBeAllPayed = willPayCollateral === false && willPayTxFee === false
  const partPayedFeeDrip =
    willPayCollateral === false ? gasFeeDrip : storageFeeDrip
  const realPayedFeeDrip = isBeAllPayed
    ? '0x0'
    : isBePayed
    ? partPayedFeeDrip
    : txFeeDrip

  return (
    <div className="flex flex-col">
      <span className="flex items-center justify-between w-full text-gray-40 mb-2">
        {t('gasFee')}
        <span className="flex items-center">
          <Link onClick={() => history.push(EDIT_GAS_FEE)}>
            {t('edit')}
            <RightOutlined className="w-3 h-3 text-primary ml-1" />
          </Link>
        </span>
      </span>
      <div
        className="flex flex-col bg-gray-4 border-gray-10 rounded px-2 py-3 relative"
        id="gasFeeContainer"
      >
        <DisplayBalance
          id="realPayedFee"
          balance={realPayedFeeDrip || '0x0'}
          maxWidth={234}
          maxWidthStyle="max-w-[234px]"
          className="text-base mb-0.5"
          symbol={symbol}
          decimals={decimals}
          initialFontSize={16}
        />
        <DisplayBalance
          id="txFee"
          balance={txFeeDrip || '0x0'}
          maxWidth={300}
          maxWidthStyle="max-w-[300px]"
          className="!text-gray-40 line-through !font-normal mb-0.5"
          symbol={symbol}
          decimals={decimals}
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
    </div>
  )
}

GasFee.propTypes = {
  estimateRst: PropTypes.object,
  isDapp: PropTypes.bool,
  willPayTxFee: PropTypes.bool,
}

export default GasFee
