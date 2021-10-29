import jazzIcon from '@fluent-wallet/jazz-icon'
import PropTypes from 'prop-types'
import {useRef, useEffect} from 'react'
import {useRPC} from '@fluent-wallet/use-rpc'
import {removeAllChild, jsNumberForAddress} from '../utils'
import {RPC_METHODS} from '../constants'
import {useSingleAddressByNetworkId} from '../hooks'
const {WALLET_GET_NETWORK} = RPC_METHODS

const useCfxMainnetAddress = accountId => {
  const {data: networkData} = useRPC(
    [WALLET_GET_NETWORK, accountId],
    {
      type: 'cfx',
    },
    {fallbackData: [{}]},
  )
  let networkId
  const cfxMainnetArr = networkData.filter(({name}) => name === 'CFX_MAINNET')
  if (cfxMainnetArr.length) {
    networkId = cfxMainnetArr[0].eid
  }
  const {data: addressData} = useSingleAddressByNetworkId(accountId, networkId)
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
