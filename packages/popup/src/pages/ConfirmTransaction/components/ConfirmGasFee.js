import PropTypes from 'prop-types'
import {GasFee} from '../../../components'
import SponsoredGasFee from './SponsoredGasFee'

function GasFeePlaceholder() {
  return (
    <div className="gas-fee-container flex flex-col">
      <div className="mb-2 h-4 w-16 rounded bg-gray-4" />
      <div className="h-[88px] rounded border border-gray-10 bg-gray-4" />
    </div>
  )
}

function ConfirmGasFee({
  sponsoredUserOperation,
  nativeToken,
  estimateRst,
  uses1559Fees,
}) {
  if (sponsoredUserOperation.loading) {
    return <GasFeePlaceholder />
  }

  if (!sponsoredUserOperation.isActive) {
    return <GasFee estimateRst={estimateRst} uses1559Fees={uses1559Fees} />
  }

  return (
    <SponsoredGasFee
      maxGasCost={sponsoredUserOperation.maxGasCost}
      nativeToken={nativeToken}
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
  uses1559Fees: PropTypes.bool,
}

export default ConfirmGasFee
