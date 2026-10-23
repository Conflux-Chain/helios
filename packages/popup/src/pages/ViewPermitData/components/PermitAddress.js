import PropTypes from 'prop-types'
import {useAddressTypeInfo} from '../../../hooks/useApi'
import {AddressDisplay} from '../../../components'
import Tooltip from '@fluent-wallet/component-tooltip'
import {formatIntoChecksumAddress} from '../../../utils'
import {shortenAddress} from '@fluent-wallet/shorten-address'

const PermitAddress = ({address}) => {
  const {type, eip7702Delegated} = useAddressTypeInfo(address)
  const isContract =
    !eip7702Delegated && (type === 'contract' || type === 'builtin')

  let displayAddress
  try {
    displayAddress = shortenAddress(formatIntoChecksumAddress(address))
  } catch {
    return address
  }
  return (
    <div className="flex items-center gap-1">
      <AddressDisplay
        address={address}
        kind="contract"
        iconClassName="w-4 h-4"
        autoFetch={isContract}
        showIcon={isContract}
        hideText
      />
      <Tooltip content={address} placement="bottomLeft">
        <span>{displayAddress}</span>
      </Tooltip>
    </div>
  )
}

PermitAddress.propTypes = {
  address: PropTypes.string,
}

export default PermitAddress
