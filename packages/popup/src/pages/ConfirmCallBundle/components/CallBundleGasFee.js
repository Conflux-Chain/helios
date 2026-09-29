import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import GasFee from '../../../components/GasFee'
import GasFeePlaceholder from '../../../components/GasFeePlaceholder'
import SponsoredGasFee from '../../../components/SponsoredGasFee'

function CallBundleGasFee({
  sponsorship,
  sponsoredBalanceCheck,
  transactionEstimate,
  network,
  gasLevel,
  onEdit,
}) {
  const {t} = useTranslation()

  if (sponsorship.loading) {
    return <GasFeePlaceholder />
  }

  if (sponsorship.available) {
    const {loading} = sponsoredBalanceCheck

    if (loading) {
      return <GasFeePlaceholder />
    }

    return (
      <SponsoredGasFee
        maxGasCost={sponsorship.maxGasCost}
        nativeToken={network.ticker}
      />
    )
  }

  const {data: estimate, error, transaction} = transactionEstimate

  return (
    <GasFee
      estimate={estimate || {error}}
      network={network}
      titleClassName="mx-1 mb-4"
      feePerGas={
        estimate?.customMaxFeePerGas ||
        estimate?.maxFeePerGas ||
        transaction?.maxFeePerGas
      }
      editLabel={t(gasLevel)}
      editDisabled={!transaction}
      onEdit={onEdit}
    />
  )
}

CallBundleGasFee.propTypes = {
  sponsorship: PropTypes.shape({
    loading: PropTypes.bool,
    available: PropTypes.bool,
    maxGasCost: PropTypes.string,
  }).isRequired,
  transactionEstimate: PropTypes.shape({
    data: PropTypes.object,
    transaction: PropTypes.object,
    loading: PropTypes.bool,
    error: PropTypes.object,
  }).isRequired,
  network: PropTypes.object.isRequired,
  gasLevel: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  sponsoredBalanceCheck: PropTypes.shape({
    loading: PropTypes.bool,
    isBalanceEnough: PropTypes.bool,
  }).isRequired,
}

export default CallBundleGasFee
