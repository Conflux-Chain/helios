import browser from 'webextension-polyfill'
import {defPort} from './port.js'

export const connect = () => defPort(browser.runtime.connect({name: 'popup'}))
