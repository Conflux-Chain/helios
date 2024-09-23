const {MNEMONIC, CFX_ACCOUNTS, ETH_ACCOUNTS} = require('./accounts.js')
const {CFXNODE, sendCFX, sendTx: cfxSendTx, cfxCall} = require('./cfx.js')
// const {Ganache, sendETH} = require('./eth.js')
const {sendETH, sendTx: ethSendTx, ethCall} = require('./sendETH.js')
const delay = require('delay')

const cfx = new CFXNODE({killPortProcess: true})
// const eth = new Ganache()

module.exports = {
  delay,
  cfx,
  // eth,
  MNEMONIC,
  CFX_ACCOUNTS,
  ETH_ACCOUNTS,
  cfxSendTx,
  cfxCall,
  sendCFX,
  sendETH,
  ethSendTx,
  ethCall,
}
