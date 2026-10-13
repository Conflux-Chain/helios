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
}) {
  const {
    data: {network},
  } = useCurrentAddress()

  if (sponsoredUserOperation.loading) {
    return <GasFeePlaceholder />
  }

  if (sponsoredUserOperation.isActive) {
    return (
      <SponsoredGasFee
        maxGasCost={sponsoredUserOperation.maxGasCost}
        nativeToken={nativeToken}
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
}

export default ConfirmGasFee
