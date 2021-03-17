import {isHexAddress, isHexAccountAddress} from '@cfxjs/checks'
import {create as createAccount} from '@cfxjs/account'

const Store = new Map()

Store.set(isHexAddress, entropy => createAccount(entropy).address)

Store.set(isHexAccountAddress, entropy => createAccount(entropy).address)
