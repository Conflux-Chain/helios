import jazzIcon from '@fluent-wallet/jazz-icon'
import PropTypes from 'prop-types'
import {useRef, useEffect} from 'react'
import {useRPC} from '@fluent-wallet/use-rpc'
import {isNumber} from '@fluent-wallet/checks'
import {isHexAddress} from '@fluent-wallet/account'
import {removeAllChild, jsNumberForAddress} from '../utils'
import {useCfxNetwork} from '../hooks/useApi'
import {RPC_METHODS} from '../constants'

const {WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK} = RPC_METHODS
const useCfxMainnetAddress = accountIdentity => {
  const cfxNetwork = useCfxNetwork()
  let networkId
  const cfxMainnetArr = cfxNetwork.filter(({name}) => name === 'CFX_MAINNET')
  if (cfxMainnetArr.length) {
    networkId = cfxMainnetArr[0].eid
  }
  const {data: accountAddress} = useRPC(
    isNumber(accountIdentity) && isNumber(networkId)
      ? [WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK, networkId, accountIdentity]
      : null,
    {accountIdentity, networkId},
    {fallbackData: {}},
  )
  const hex = isHexAddress(accountIdentity)
    ? accountIdentity
    : accountAddress?.hex
  return jsNumberForAddress(hex)
}

function Avatar({diameter, accountIdentity, ...props}) {
  const address = useCfxMainnetAddress(accountIdentity)
  const avatarContainerRef = useRef(null)
  useEffect(() => {
    const avatarDom = jazzIcon(diameter, address)
    removeAllChild(avatarContainerRef.current)
    avatarContainerRef.current.appendChild(avatarDom)
  }, [avatarContainerRef, diameter, address])
  return <div {...props} ref={avatarContainerRef} />
}

Avatar.propTypes = {
  accountIdentity: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  diameter: PropTypes.number.isRequired,
  containerClassName: PropTypes.string,
}
export default Avatar
