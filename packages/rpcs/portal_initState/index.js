/**
 * @fileOverview rpc defination of portal_initState
 * @name index.js
 */

import browser from 'webextension-polyfill'
import {EXT_STORAGE} from 'consts'

export const NAME = 'portal_initState'

const INIT_STATE = {a: 1}

export async function main({params: externalInitState, setState}) {
  const stateFromStorage = await browser.storage.local.get(EXT_STORAGE)
  setState({
    ...INIT_STATE,
    ...externalInitState,
    ...stateFromStorage[EXT_STORAGE],
  })
}
