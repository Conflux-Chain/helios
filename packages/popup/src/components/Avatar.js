import jazzIcon from '@fluent-wallet/jazz-icon'
import PropTypes from 'prop-types'
import {useRef, useEffect, useState} from 'react'
import {isArray, isUndefined} from '@fluent-wallet/checks'
import {isHexAddress} from '@fluent-wallet/account'
import {decode, validateBase32Address} from '@fluent-wallet/base32-address'
import {removeAllChild, jsNumberForAddress} from '../utils'
import {useAddress, useCurrentAddress} from '../hooks/useApi'
import {RPC_METHODS} from '../constants'
import {CFX_MAINNET_CHAINID} from '@fluent-wallet/consts'

const {ACCOUNT_GROUP_TYPE} = RPC_METHODS

const useAvatarAddress = address => {
  const [avatarAddress, setAvatarAddress] = useState(undefined)

  const {
    data: {
      network: {eid: networkId, netId, type, chainId},
    },
  } = useCurrentAddress()

  // get built-in account id
  const {data: accountData} = useAddress({
    value: address,
    networkId,
    stop: isHexAddress(address) || isUndefined(networkId),
  })
  const accountId = accountData?.account?.[0]?.eid

  // get built-in cfx mainnet address
  const {data: addressData} = useAddress({
    accountId,
    stop:
      isHexAddress(address) ||
      isUndefined(accountId) ||
      chainId === CFX_MAINNET_CHAINID,
  })

  useEffect(() => {
    if (isUndefined(netId)) {
      return
    }

    // EVM address or invalidated address
    if (isHexAddress(address) || !validateBase32Address(address, netId)) {
      return setAvatarAddress(jsNumberForAddress(address))
    }

    // external cfx address
    if (accountData === null) {
      return setAvatarAddress(jsNumberForAddress(decode(address)?.hexAddress))
    }
    // built-in cfx address (current network is mainnet)
    if (chainId === CFX_MAINNET_CHAINID) {
      return setAvatarAddress(jsNumberForAddress(accountData?.hex))
    }
    // built-in cfx address (current network is testnet)
    if (isArray(addressData) && addressData.length) {
      let hex
      const accountGroupType =
        addressData?.[0]?.account?.[0]?.accountGroup?.vault?.type

      if (accountGroupType === ACCOUNT_GROUP_TYPE.HW) {
        hex = addressData?.[0]?.hex
      }
      if (
        accountGroupType === ACCOUNT_GROUP_TYPE.HD ||
        accountGroupType === ACCOUNT_GROUP_TYPE.PK
      ) {
        hex = addressData.filter(
          ({network}) => network?.chainId === CFX_MAINNET_CHAINID,
        )?.[0]?.hex
      }
      setAvatarAddress(jsNumberForAddress(hex))
    }
  }, [accountData, address, addressData, chainId, netId, type])
  return avatarAddress
}

function Avatar({diameter, address, ...props}) {
  const renderAddress = useAvatarAddress(address)
  const avatarContainerRef = useRef(null)
  useEffect(() => {
    const avatarDom = jazzIcon(diameter, renderAddress)
    removeAllChild(avatarContainerRef.current)
    avatarContainerRef.current.appendChild(avatarDom)
  }, [avatarContainerRef, diameter, renderAddress])
  return <div {...props} ref={avatarContainerRef} />
}

Avatar.propTypes = {
  // hex address or base32 address. base32 address must comply with the current network
  address: PropTypes.string.isRequired,
  diameter: PropTypes.number.isRequired,
  containerClassName: PropTypes.string,
}
export default Avatar
