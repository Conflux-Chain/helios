import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {GasFee} from '../../../components'
import {useCheckImage} from '../../../hooks'

function SponsoredGasFee({maxGasCost, nativeToken, estimateRst, uses1559Fees}) {
  const {t} = useTranslation()
  const nativeTokenIcon =
    nativeToken?.logoURI || nativeToken?.icon || nativeToken?.iconUrls?.[0]
  const isImgUrl = useCheckImage(nativeTokenIcon)

  return (
    <GasFee
      estimateRst={estimateRst}
      uses1559Fees={uses1559Fees}
      showDrip={false}
      displayFee={{
        balance: maxGasCost,
        symbol: nativeToken?.symbol,
        decimals: nativeToken?.decimals,
      }}
      sponsored
      editDisabled
      editLabel={t('medium')}
      prefix={
        <div className="mr-2 flex items-center justify-center rounded-full bg-gray-0">
          <img
            src={isImgUrl ? nativeTokenIcon : '/images/default-token-icon.svg'}
            alt=""
            className="h-8 w-8 rounded-full"
          />
        </div>
      }
    />
  )
}

SponsoredGasFee.propTypes = {
  maxGasCost: PropTypes.string,
  nativeToken: PropTypes.object,
  estimateRst: PropTypes.object,
  uses1559Fees: PropTypes.bool,
}

export default SponsoredGasFee
