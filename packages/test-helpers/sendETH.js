const ethers = require('ethers')

const init = ({
  url = 'http://localhost:8545',
  pk = '46b9e861b63d3509c88b7817275a30d22d62c8cd8fa6486ddee35ef0d8e0495f',
} = {}) => {
  const provider = new ethers.providers.JsonRpcProvider(url)
  const wallet = new ethers.Wallet(pk, provider)
  return {provider, wallet}
}

const sendTx = async ({tx, url, pk} = {}) => {
  const {wallet} = init({url, pk})
  return await wallet.sendTransaction(tx).then(r => r.wait())
}

const ethCall = async ({tx, url, pk}) => {
  const {wallet} = init({url, pk})
  return wallet.call(tx)
}

const sendETH = async ({to, balance}, url, pk) => {
  return await sendTx({tx: {to, value: balance}, url, pk})
}

const sendRawTx = async ({tx, url} = {}) => {
  const {provider} = init(url)
  return await provider.sendTransaction(tx).then(r => r.wait())
}

module.exports = {sendETH, sendTx, sendRawTx, ethCall}
