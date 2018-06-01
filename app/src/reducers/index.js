import { combineReducers } from 'redux'

import Web3 from './web3'
import Token from './token'
import Account from './account'
import Gas from './gas'

const root = combineReducers({
  web3: Web3,
  Token: Token,
  account: Account,
  gasPrice: Gas
})

export default root
