import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import GasFee from '../../../components/GasFee'
import GasFeePlaceholder from '../../../components/GasFeePlaceholder'
import SponsoredGasFee from '../../../components/SponsoredGasFee'
import {useCurrentTxStore} from '../../../hooks'
import {useCurrentAddress} from '../../../hooks/useApi'
import {ROUTES} from '../../../constants'

function ConfirmGasFee({
  sponsoredUserOperation,
  nativeToken,
  estimateRst,
  uses1559Fees,
}) {
  const {t} = useTranslation()
  const history = useHistory()
  const {gasPrice, maxFeePerGas, gasLevel} = useCurrentTxStore()
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
      feePerGas={uses1559Fees ? maxFeePerGas : gasPrice}
      editLabel={uses1559Fees ? t(gasLevel) : t('edit')}
      onEdit={() => history.push(ROUTES.EDIT_GAS_FEE)}
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
