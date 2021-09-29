const fs = require('fs')
const path = require('path')
const {promisify} = require('util')
const readfile = promisify(fs.readFile)
const {Interface} = require('@ethersproject/abi')

const contractPath = path.resolve(__dirname, '../contracts/compiled')
const contractsName = [
  // cfx net2999:acfdzevjd15ew6jfme7vuzb94s5a276sjayhcynp0j
  // cfx 0x8a3a92281df6497105513b18543fd3b60c778e40
  // eth 0xE5538A1FC85641053F5e4824846390c75B779A5F
  'Create2Factory',
  // cfx 0x88887eD889e776bCBe2f0f9932EcFaBcDfCd1820
  // eth 0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24
  'ERC1820Registry',
  // cfx net2999:ach8cpret14pg9huwjtpva62w2pa1z1d0ub91hshds
  // cfx 0x8fe131a47df4c37cf0921ec8839896180bd6e3b4
  // eth 0x33845d47195725a6b0a08eeda1e60ce9f2dcc80b
  'BalanceChecker',
  // 'TestToken1',
  // 'TestToken2',
]
let contractsBin = contractsName.map(c =>
  path.resolve(contractPath, `./${c}.bin`),
)
let contractsAbi = contractsName.map(c =>
  path.resolve(contractPath, `./${c}.abi`),
)

const getContracts = async () => {
  const contract = {
    bin: await Promise.all(
      contractsBin.map(c => readfile(c, {encoding: 'utf-8'})),
    ),
    abi: await Promise.all(
      contractsAbi.map(c =>
        readfile(c, {encoding: 'utf-8'}).then(abi => JSON.parse(abi)),
      ),
    ),
  }

  return contractsName.reduce(
    (acc, c, idx) => ({
      ...acc,
      [c]: {
        abi: contract.abi[idx],
        bin: contract.bin[idx],
        contract: new Interface(contract.abi[idx]),
      },
    }),
    {},
  )
}

module.exports = {getContracts}
