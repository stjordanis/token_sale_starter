require('babel-register')
require('babel-polyfill')
const assert = require('assert')
const prod = process.env.ENV === 'production'
const envLoc = prod ? './.env' : './.env.sample'
require('dotenv').config({ path: envLoc })
// const HDWalletProvider = require('truffle-hdwallet-provider-privkey')
const HDWalletProvider = require('truffle-hdwallet-provider')

assert.equal(typeof process.env.MNEMONIC, 'string', 'We need mnemonic')
assert.equal(typeof process.env.INFURA_API_KEY, 'string', 'We need Infura API key')
assert.equal(typeof process.env.OWNER, 'string', 'We need owner address')

const config = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: 336
    },
    rinkeby: {
      host: 'localhost',
      port: 8545,
      network_id: '4',
      from: process.env.OWNER,
      gas: 6712390
    },
    ropsten: {
      provider: new HDWalletProvider(process.env.MNEMONIC, `https://ropsten.infura.io/${process.env.INFURA_API_KEY}`),
      network_id: 3,
      gas: 6712390
    },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 8545,
      gas: 0xfffffffffff,
      gasPrice: 0x01
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
 }
 
module.exports = config
