/**
 * @fileOverview rpc defination of portal_initState
 * @name index.js
 */

import browser from 'webextension-polyfill'
import {EXT_STORAGE} from 'consts'

export const NAME = 'portal_initState'

const INIT_STATE = {a: 1}

export function main({setState}) {
  return async (extraInitState = {}) => {
    const stateFromStorage = await browser.storage.local.get(EXT_STORAGE)
    setState({
      ...INIT_STATE,
      ...extraInitState,
      ...stateFromStorage[EXT_STORAGE],
    })
  }
}
