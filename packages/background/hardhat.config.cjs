const {ETH_ACCOUNTS} = require('@fluent-wallet/test-helpers')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.24',
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: [
        {
          privateKey:
            '0x46b9e861b63d3509c88b7817275a30d22d62c8cd8fa6486ddee35ef0d8e0495f',
          balance: '10000000000000000000',
        },
        ...ETH_ACCOUNTS.map(a => ({
          privateKey: a.privateKey,
          balance: '10000000000000000000',
        })),
      ],
    },
  },
}
