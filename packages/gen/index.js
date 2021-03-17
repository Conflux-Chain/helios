import {isHexAddress, isHexAccountAddress} from '@cfxjs/checks'
import {create as createAccount} from '@cfxjs/account'
import {randomHex} from '@cfxjs/utils'

const Store = new Map()

Store.set(
  isHexAddress,
  entropy => createAccount(entropy || randomHex(32)).address,
)

Store.set(
  isHexAccountAddress,
  entropy => createAccount(entropy || randomHex(32)).address,
)
