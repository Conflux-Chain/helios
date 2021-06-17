const path = require('path')

const {Ganache} = require(path.resolve(
  __dirname,
  '../packages/test-helpers/eth.js',
))
const eth = new Ganache()
;(async () => {
  await eth.start()
})()
