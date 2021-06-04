const ethers = require('ethers')
const sendETH = async ({to, balance}, url) => {
  const urlProvider = new ethers.providers.JsonRpcProvider(
    url || 'http://localhost:8545',
  )
  const wallet = new ethers.Wallet(
    '46b9e861b63d3509c88b7817275a30d22d62c8cd8fa6486ddee35ef0d8e0495f',
    urlProvider,
  )
  return await wallet.sendTransaction({to, value: balance}).then(r => r.wait())
}

module.exports = sendETH
