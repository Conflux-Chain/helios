import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {RightOutlined} from '@fluent-wallet/component-icons'
import DisplayBalance from './DisplayBalance'
import GasFeeCard from './GasFeeCard'
import {useCheckImage} from '../hooks'

function SponsoredGasFee({maxGasCost, nativeToken}) {
  const {t} = useTranslation()

  const nativeTokenIcon =
    nativeToken?.logoURI || nativeToken?.icon || nativeToken?.iconUrls?.[0]
  const isImgUrl = useCheckImage(nativeTokenIcon)

  const action = (
    <span className="flex items-center gap-1 text-primary">
      {t('medium')}
      <RightOutlined className="h-3 w-3" />
    </span>
  )

  const statusTag = (
    <span className="text-2xs text-white">{t('sponsored')}</span>
  )

  const tokenIcon = (
    <img
      src={isImgUrl ? nativeTokenIcon : '/images/default-token-icon.svg'}
      alt=""
      className="h-8 w-8 rounded-full"
    />
  )

  return (
    <GasFeeCard
      title={t('gasFee')}
      action={action}
      prefix={tokenIcon}
      statusTag={statusTag}
      titleClassName="mx-1 mb-4"
      contentClassName="min-h-[84px] items-start gap-2 border p-3"
      statusTagClassName="-right-px -top-px"
    >
      <DisplayBalance
        id="realPayedFee"
        balance="0x0"
        className="e-space-gas-fee-user-cost mb-0.5 !font-body text-base !font-medium !text-gray-80"
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
