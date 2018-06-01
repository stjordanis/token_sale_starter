require('babel-register')
require('babel-polyfill')
const chalk = require('chalk')
const prod = false
const envLoc = prod ? '../.env' : '../.env'
require('dotenv').config({ path: envLoc })
const assert = require('assert')
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
const Token = artifacts.require('./Crowdsale.sol')
assert.equal(typeof process.env.OWNER, 'string', 'We need owner address')

module.exports = function(deployer, network, accounts) {
  const _wallet = prod ? process.env.OWNER : accounts[0]

  return deployer
    .then(() => {
      return deployer.deploy(
        Token,
        { from: _wallet, gas: 6712390, gasPrice: web3.toWei(4, 'gwei') }
      )
    })
    .then(async () => {
      const token = await Token.deployed()
      console.log(`Token address: ${chalk.green(token.address)}`)
    })

}
