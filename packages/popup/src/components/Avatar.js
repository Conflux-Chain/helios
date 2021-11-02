import jazzIcon from '@fluent-wallet/jazz-icon'
import PropTypes from 'prop-types'
import {useRef, useEffect} from 'react'
import {removeAllChild, jsNumberForAddress} from '../utils'
import {useCfxNetwork, useAddressByNetworkId} from '../hooks/useApi'

const useCfxMainnetAddress = accountId => {
  const cfxNetwork = useCfxNetwork()
  let networkId
  const cfxMainnetArr = cfxNetwork.filter(({name}) => name === 'CFX_MAINNET')
  if (cfxMainnetArr.length) {
    networkId = cfxMainnetArr[0].eid
  }
  const addressData = useAddressByNetworkId(accountId, networkId)
  console.log(addressData?.cfxHex || addressData?.hex)
  return jsNumberForAddress(addressData?.cfxHex || addressData?.hex)
}

function Avatar({diameter, accountId, ...props}) {
  const address = useCfxMainnetAddress(accountId)
  const avatarContainerRef = useRef(null)
  useEffect(() => {
    const avatarDom = jazzIcon(diameter, address)
    removeAllChild(avatarContainerRef.current)
    avatarContainerRef.current.appendChild(avatarDom)
  }, [avatarContainerRef, diameter, address])
  return <div {...props} ref={avatarContainerRef} />
}

Avatar.propTypes = {
  accountId: PropTypes.number.isRequired,
  diameter: PropTypes.number.isRequired,
  containerClassName: PropTypes.string,
}
export default Avatar
