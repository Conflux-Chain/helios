import PropTypes from 'prop-types'
import GasFee from '../../../components/GasFee'
import GasFeePlaceholder from '../../../components/GasFeePlaceholder'
import SponsoredGasFee from '../../../components/SponsoredGasFee'
import {useCurrentAddress} from '../../../hooks/useApi'

function ConfirmGasFee({
  sponsoredUserOperation,
  nativeToken,
  estimateRst,
  feePerGas,
  editLabel,
  onEdit,
  sponsorshipControl,
}) {
  const {
    data: {network},
  } = useCurrentAddress()

  if (sponsoredUserOperation.loading) {
    return <GasFeePlaceholder sponsorshipControl={sponsorshipControl} />
  }

  if (sponsoredUserOperation.isActive) {
    return (
      <SponsoredGasFee
        maxGasCost={sponsoredUserOperation.maxGasCost}
        nativeToken={nativeToken}
        sponsorshipControl={sponsorshipControl}
      />
    )
  }

  return (
    <GasFee
      estimate={estimateRst}
      network={network}
      feePerGas={feePerGas}
      editLabel={editLabel}
      onEdit={onEdit}
      sponsorshipControl={sponsorshipControl}
    />
  )
}

ConfirmGasFee.propTypes = {
  sponsoredUserOperation: PropTypes.shape({
    isActive: PropTypes.bool,
    loading: PropTypes.bool,
    maxGasCost: PropTypes.string,
  }),
  nativeToken: PropTypes.object,
  estimateRst: PropTypes.object,
  feePerGas: PropTypes.string,
  editLabel: PropTypes.string,
  onEdit: PropTypes.func.isRequired,
  sponsorshipControl: PropTypes.object,
}

export default ConfirmGasFee
