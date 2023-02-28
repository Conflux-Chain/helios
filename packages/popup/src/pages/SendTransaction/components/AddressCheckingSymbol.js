import PropTypes from 'prop-types'
import Loading from '@fluent-wallet/component-loading'
import {AddressCheckedSymbol} from './'

function AddressCheckingSymbol({loading, checked, ...props}) {
  if (loading) {
    return <Loading {...props} />
  }
  return <AddressCheckedSymbol {...props} checked={checked} />
}

AddressCheckingSymbol.propTypes = {
  loading: PropTypes.bool,
  checked: PropTypes.bool,
}

export default AddressCheckingSymbol
