import {fromChannel} from '@thi.ng/rstream-csp'
import {chan} from '@cfxjs/csp'
import {debounce} from '@thi.ng/rstream'
import browser from 'webextension-polyfill'
import {EXT_STORAGE} from 'consts'

const persistChannel = chan()
const persistStream = fromChannel(persistChannel)

persistStream
  .subscribe(debounce(500))
  .subscribe({next: data => browser.storage.local.set({[EXT_STORAGE]: data})})

export const persist = persistChannel.write.bind(persistChannel)
