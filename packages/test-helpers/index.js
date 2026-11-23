const {MNEMONIC, CFX_ACCOUNTS, ETH_ACCOUNTS} = require('./accounts.js')
const {sendCFX, sendTx: cfxSendTx, cfxCall} = require('./cfx.js')
// const {Ganache, sendETH} = require('./eth.js')
const {sendETH, sendTx: ethSendTx, ethCall} = require('./sendETH.js')
const delay = require('delay')

// const eth = new Ganache()

module.exports = {
  delay,
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
