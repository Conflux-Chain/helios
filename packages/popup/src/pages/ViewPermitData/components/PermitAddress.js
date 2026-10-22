import PropTypes from 'prop-types'
import {useAddressTypeInfo} from '../../../hooks/useApi'
import {AddressDisplay} from '../../../components'

const PermitAddress = ({address}) => {
  const {type, eip7702Delegated} = useAddressTypeInfo(address)
  const isContract =
    !eip7702Delegated && (type === 'contract' || type === 'builtin')
  return (
    <AddressDisplay
      address={address}
      kind={isContract ? 'contract' : 'address'}
      iconClassName="w-4 h-4"
      autoFetch={isContract}
      hideText
    />
  )
}

PermitAddress.propTypes = {
  address: PropTypes.string,
}

export default PermitAddress
