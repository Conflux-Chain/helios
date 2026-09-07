import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Link from '@fluent-wallet/component-link'
import {RightOutlined} from '@fluent-wallet/component-icons'
import DisplayBalance from '../../../components/DisplayBalance'
import GasFeeCard from '../../../components/GasFeeCard'
import {useCheckImage} from '../../../hooks'
import {ROUTES} from '../../../constants'

const {EDIT_GAS_FEE} = ROUTES

function SponsoredGasFee({maxGasCost, nativeToken}) {
  const {t} = useTranslation()
  const history = useHistory()

  const nativeTokenIcon =
    nativeToken?.logoURI || nativeToken?.icon || nativeToken?.iconUrls?.[0]
  const isImgUrl = useCheckImage(nativeTokenIcon)

  // The sponsored UserOperation has no gas cost for the user.
  const userGasCost = '0x0'

  const action = (
    <span className="flex items-center">
      <Link onClick={() => history.push(EDIT_GAS_FEE)} disabled>
        {t('medium')}
        <RightOutlined className="ml-1 h-3 w-3 text-gray-40" />
      </Link>
    </span>
  )

  const statusTag = (
    <span className="text-2xs text-white">{t('sponsored')}</span>
  )

  const tokenIcon = (
    <div className="mr-2 flex items-center justify-center rounded-full bg-gray-0">
      <img
        src={isImgUrl ? nativeTokenIcon : '/images/default-token-icon.svg'}
        alt=""
        className="h-8 w-8 rounded-full"
      />
    </div>
  )

  return (
    <GasFeeCard
      title={t('gasFee')}
      action={action}
      prefix={tokenIcon}
      statusTag={statusTag}
    >
      <DisplayBalance
        id="realPayedFee"
        balance={userGasCost}
        className="e-space-gas-fee-user-cost !font-body text-base !font-medium !text-gray-80"
        symbol={nativeToken?.symbol}
        decimals={nativeToken?.decimals}
        initialFontSize={16}
      />

      <DisplayBalance
        id="sponsoredFee"
        balance={maxGasCost}
        className="e-space-gas-fee-sponsored-cost !font-body text-sm !font-normal !text-gray-40 line-through"
        symbol={nativeToken?.symbol}
        decimals={nativeToken?.decimals}
        initialFontSize={14}
      />
    </GasFeeCard>
  )
}

SponsoredGasFee.propTypes = {
  maxGasCost: PropTypes.string,
  nativeToken: PropTypes.object,
}

export default SponsoredGasFee
