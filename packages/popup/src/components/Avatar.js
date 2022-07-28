import jazzIcon from '@fluent-wallet/jazz-icon'
import PropTypes from 'prop-types'
import {useRef, useEffect} from 'react'
import {isHexAddress} from '@fluent-wallet/account'
import {decode, validateBase32Address} from '@fluent-wallet/base32-address'
import {removeAllChild, jsNumberForAddress} from '../utils'

function Avatar({diameter, address, ...props}) {
  const renderAddress = jsNumberForAddress(
    isHexAddress(address)
      ? address
      : validateBase32Address(address)
      ? decode(address)?.hexAddress
      : '',
  )
  const avatarContainerRef = useRef(null)
  useEffect(() => {
    const avatarDom = jazzIcon(diameter, renderAddress)
    removeAllChild(avatarContainerRef.current)
    avatarContainerRef.current.appendChild(avatarDom)
  }, [avatarContainerRef, diameter, renderAddress])
  return <div {...props} ref={avatarContainerRef} />
}

Avatar.propTypes = {
  address: PropTypes.string,
  diameter: PropTypes.number.isRequired,
  containerClassName: PropTypes.string,
}
export default Avatar
