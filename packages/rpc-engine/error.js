/**
 * @fileOverview error defination for rpc-engine
 * @name error.js
 */

import {defError} from '@cfxjs/errors'
import {identity} from '@cfxjs/compose'

export const RpcEngineError = defError(() => '[@cfxjs/rpc-engin] ', identity)
