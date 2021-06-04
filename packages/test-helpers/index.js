const {CFXNODE, sendCFX} = require('./cfx.js')
// const {Ganache, sendETH} = require('./eth.js')
const sendETH = require('./sendETH.js')
const delay = require('delay')

const cfx = new CFXNODE({killPortProcess: true})
// const eth = new Ganache()
const MNEMONIC =
  'error mom brown point sun magnet armor fish urge business until plastic'

const ACCOUNTS = [
  {
    address: '0xe68539313a4a03211ee03f5f9a6c149751fb4f44',
    privateKey:
      '0x27060ca3f246dac356b785a4fb98656a7750d5a3fe5c519dd6d2e17cd8ca7906',
    index: 1,
  },
  {
    address: '0x8bb3720c8323cfb8fefdbdb9229872ed34ef9b57',
    privateKey:
      '0xe77d4353a349d770b7d2f6d0f1870231f2e7a850b9b0c0a50da6b34f1db46da9',
    index: 2,
  },
  {
    address: '0xfa7ec9a3befd686393b2105e88fa31484a2f072f',
    privateKey:
      '0xbe05f6d746489c2d216ba3c3ee40f42b8caf5ca60836faa05eb05d68a1d33942',
    index: 3,
  },
  {
    address: '0xaf6f1a940f67b27514683239889def43d9d5106e',
    privateKey:
      '0x6c5e7d010fb60e3305d00cf5dccfe9da1dd6cf3ac8793bfdf51c2dd1e36a9226',
    index: 4,
  },
  {
    address: '0x22b97cfe15fc16a7da78d0483138adb0a7e521e8',
    privateKey:
      '0x3771c552fe6c256f1b26d969fdd503ce7bb23d95823adb248e221c95698f515a',
    index: 5,
  },
  {
    address: '0xf4148df077c5c0cabdbb637989e93d083f715256',
    privateKey:
      '0xfc70edae23d39f6009369c692bc5cda0872680a169a531d8d148fd2af09d4276',
    index: 6,
  },
  {
    address: '0xc222f26a0b7bb5302152673dc40d9eb4436c461d',
    privateKey:
      '0x284595e3b3b1bf20d1281747ae5c4aef2f4d0270ac327057dcccab08e31f9078',
    index: 7,
  },
  {
    address: '0x3da6bce29dacc740369b259b29b93cd6425c7108',
    privateKey:
      '0x080d44ec61d07fe49da897d44c3213606389f8329efcf9a783fa5ae97aa00768',
    index: 8,
  },
  {
    address: '0xd465709d8195fff311333fc454b5e792ddc4ba12',
    privateKey:
      '0xc13af00b42e30c3e878a20852996078b83011b89a20194fd4db566d1e3a7001e',
    index: 9,
  },
  {
    address: '0x6a4a6adc083fc3f6f2565fada79cb18f0db84a60',
    privateKey:
      '0xd887f0c2374997b1e69bdb72f2cdb938ebc0765241144b133e33f0e92b79c7c4',
    index: 10,
  },
]

module.exports = {
  delay,
  cfx,
  // eth,
  MNEMONIC,
  ACCOUNTS,
  sendCFX,
  sendETH,
}
