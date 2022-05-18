import jazzIcon from '@fluent-wallet/jazz-icon'
import PropTypes from 'prop-types'
import {useRef, useEffect, useState} from 'react'
import {isNumber, isArray} from '@fluent-wallet/checks'
import {isHexAddress} from '@fluent-wallet/account'
import {removeAllChild, jsNumberForAddress} from '../utils'
import {useAddress} from '../hooks/useApi'
import {RPC_METHODS} from '../constants'
import {CFX_MAINNET_CHAINID} from '@fluent-wallet/consts'

const {ACCOUNT_GROUP_TYPE} = RPC_METHODS

const useAvatarAddress = accountIdentity => {
  const [address, setAddress] = useState(undefined)

  const {data} = useAddress({
    stop: !isNumber(accountIdentity),
    accountId: accountIdentity,
  })
  useEffect(() => {
    let hex

    if (isHexAddress(accountIdentity)) {
      hex = accountIdentity
    } else if (isArray(data) && data.length) {
      const accountGroupType =
        data?.[0]?.account?.[0]?.accountGroup?.vault?.type

      if (accountGroupType === ACCOUNT_GROUP_TYPE.HW) {
        hex = data?.[0]?.hex
      }
      if (
        accountGroupType === ACCOUNT_GROUP_TYPE.HD ||
        accountGroupType === ACCOUNT_GROUP_TYPE.PK
      ) {
        hex = data.filter(
          ({network}) => network?.chainId === CFX_MAINNET_CHAINID,
        )?.[0]?.hex
      }
    }
    setAddress(jsNumberForAddress(hex))
  }, [accountIdentity, data])

  return address
}

function Avatar({diameter, accountIdentity, ...props}) {
  const address = useAvatarAddress(accountIdentity)
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
