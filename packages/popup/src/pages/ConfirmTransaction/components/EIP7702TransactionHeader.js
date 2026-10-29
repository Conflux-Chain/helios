import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import TransactionDirection from './TransactionDirection'

function EIP7702TransactionHeader({
  authorityNickname,
  authority,
  delegateAddress,
  title,
  delegateAddressLabel,
}) {
  const {t} = useTranslation()

  return (
    <div
      id="addressCardContainer"
      className="address-card-container w-full flex flex-col pt-3 pb-6 px-4 items-center bg-blue-card-linear bg-no-repeat bg-cover mt-1 mb-4"
    >
      <header
        className="address-card-header text-primary flex items-center"
        id="addressCardTitle"
      >
        <img alt="icon" className="w-3 h-3 mr-1" src="/images/sign-icon.svg" />
        {title || t('signTransaction')}
      </header>
      <TransactionDirection
        fromAddress={authority}
        toAddress={delegateAddress}
        fromAddressLabel={authorityNickname}
        toAddressLabel={delegateAddressLabel}
      />
    </div>
  )
}

EIP7702TransactionHeader.propTypes = {
  authority: PropTypes.string,
  delegateAddress: PropTypes.string,
  title: PropTypes.string,
  delegateAddressLabel: PropTypes.string,
  authorityNickname: PropTypes.string,
}

export default EIP7702TransactionHeader
