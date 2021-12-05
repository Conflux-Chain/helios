import jazzIcon from '@fluent-wallet/jazz-icon'
import PropTypes from 'prop-types'
import {useRef, useEffect} from 'react'
import {useRPC} from '@fluent-wallet/use-rpc'
import {isNumber} from '@fluent-wallet/checks'
import {removeAllChild, jsNumberForAddress} from '../utils'
import {useCfxNetwork} from '../hooks/useApi'
import {RPC_METHODS} from '../constants'

const {WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK} = RPC_METHODS
const useCfxMainnetAddress = accountId => {
  const cfxNetwork = useCfxNetwork()
  let networkId
  const cfxMainnetArr = cfxNetwork.filter(({name}) => name === 'CFX_MAINNET')
  if (cfxMainnetArr.length) {
    networkId = cfxMainnetArr[0].eid
  }
  const {data: accountAddress} = useRPC(
    isNumber(accountId) && isNumber(networkId)
      ? [WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK, networkId, accountId]
      : null,
    {accountId, networkId},
    {fallbackData: {}},
  )
  const {hex} = accountAddress || {}
  return jsNumberForAddress(hex.replace(/^0x\d/, '0x1'))
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
  accountId: PropTypes.number,
  diameter: PropTypes.number.isRequired,
  containerClassName: PropTypes.string,
}
export default Avatar
