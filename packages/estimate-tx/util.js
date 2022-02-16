import BN from 'bn.js'
import {stripHexPrefix} from '@fluent-wallet/utils'

export const bn16 = x => new BN(stripHexPrefix(x), 16)
export const pre0x = x => `0x${x}`
