const CFXNODE = require('@cfxjs/fullnode')
const {Conflux, format} = require('js-conflux-sdk')

const CHAINID = '0xbb7'
const NETWORK_ID = 2999
const GENESIS_PRI_KEY =
  '0x46b9e861b63d3509c88b7817275a30d22d62c8cd8fa6486ddee35ef0d8e0495f'
const GENESIS_ADDRESS = '0x1be45681ac6c53d5a40475f7526bac1fe7590fb8'
let GENESIS_ACCOUNT
const DEFAULT_PORT = 12537
let cfx

const sendCFX = async ({to, balance} = {}, url) => {
  cfx =
    cfx ||
    new Conflux({
      url: url || `http://localhost:${DEFAULT_PORT}`,
      chainId: CHAINID,
      networkId: NETWORK_ID,
    })
  GENESIS_ACCOUNT = GENESIS_ACCOUNT || cfx.wallet.addPrivateKey(GENESIS_PRI_KEY)

  const txParams = {
    from: GENESIS_ACCOUNT.address,
    value: balance || 0,
    to: format.address(to.replace(/^0x./, '0x1'), NETWORK_ID),
    chainId: parseInt(CHAINID, 16),
  }

  const transactionResult = await cfx
    .sendTransaction(txParams)
    .confirmed({delta: 100})
    .catch(err => {
      throw err
    })

  return transactionResult
}

module.exports = {
  sendCFX,
  CFXNODE,
  GENESIS_PRI_KEY,
  GENESIS_ADDRESS,
}
