require('babel-register')
require('babel-polyfill')
const assert = require('assert')
const prod = true
const envLoc = prod ? './.env' : './.env.sample'
require('dotenv').config({ path: envLoc })
const HDWalletProvider = require('truffle-hdwallet-provider-privkey')
const Web3 = require('web3')
const web3 = new Web3()

assert.equal(typeof process.env.PRIVATE_KEY, 'string', 'We need wallet key')
assert.equal(typeof process.env.INFURA_API_KEY, 'string', 'We need Infura API key')
assert.equal(typeof process.env.OWNER, 'string', 'We need owner address')

const config = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: 336,
      gas: 6712390,
      gasPrice: 10000000000
    },
    rinkeby: {
      provider: () => {
        return new HDWalletProvider(process.env.PRIVATE_KEY, `https://rinkeby.infura.io/${process.env.INFURA_API_KEY}`)
      },
      network_id: 4,
      gas: 6712390
    },
    ropsten: {
      provider: () => {
        return new HDWalletProvider(process.env.PRIVATE_KEY, `https://ropsten.infura.io/${process.env.INFURA_API_KEY}`)
      },
      network_id: 3,
      gas: 6712390
    },
    main: {
      provider: () => {
        return new HDWalletProvider(process.env.PRIVATE_KEY, `https://mainnet.infura.io/${process.env.INFURA_API_KEY}`)
      },
      network_id: 1,
      gas: 4712390,
      gasPrice: web3.toWei(4, 'gwei')
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
