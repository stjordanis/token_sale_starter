<p align="center">
  <a href="https://identiform.com/">
    <img alt="identiForm" src="https://github.com/Identiform/token_sale_starter/master/media/logo.png" width="683">
  </a>
</p>

# Token Sale Starter

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Dependency Status](https://david-dm.org/Identiform/token_sale_starter.svg)](https://david-dm.org/Identiform/token_sale_starter)
[![devDependency Status](https://david-dm.org/Identiform/token_sale_starter/dev-status.svg)](https://david-dm.org/Identiform/token_sale_starter/?type=dev)
[![Build Status](https://travis-ci.org/Identiform/token_sale_starter.svg?branch=master)](https://travis-ci.org/Identiform/token_sale_starter)

Token Sale Starter is a quick to start token sale contract and dApp with following features:

* ERC-20 compatible
* Buy and transfer tokens for end users
* Withdraw, set rate, whitelists, etc. for owner

Sales through this contract/ dApp after the event should then be imported into main contract (see below).

## Why?

![Token Sale Strater dApp]](media/dapp.png)

We have too many repeating functions for each new contract. Why instead not to modularize everything and 
make a contract for the just a single specific job of the major contract? Think of this project as a library-driven 
development for business processes. This one is meant to do simple task - you fill the token details (what you're selling) and requirements into dApp and get running own ICO site without touching the code.

## Install

```
npm i
cd app
npm i
```

## Run locally

```
npm run rpc
truffle migrate --network development --reset
npm run copy
cd app
npm start
```

## Management of ICO

See test/crowdsale.js for available management integration tests.

## Test

```
npm run rpc
truffle test
```

## How to start the sale

1. Deploy contract.
2. Launch the dApp and set the crowdsale parameters.
3. Set the whitelisting requirement (if so, you'll need to add each buyer to whitelist before the sale).

## Buys from other blockchains

You can sell tokens for any cryptocurrency. First, you need to set up "bot" address, which will manage this trade 
querying (isn't done by this package) your chains' addresses and calling following crowdale function:

```
foreignBuy(address _recipient, uint _tokens, string _txHash)
```

## Migrate Tokens to  Main Contract

This is modular contract/dApp, which meant to migrate token holders to main contract after a sale.

1. Set the bot address

Main Contract should inherit ICrowdsale from contracts/interfaces interface using following (example):

```
import "./ICrowdsale.sol";

ICrowdsale crowdsale;

function setTokenSaleStarterAddress(address _addr) public onlyOwner {
    crowdsale = ICrowdsale(_addr);
}

function _migrate(address _recipient) internal {
    uint _balance = crowdsale.balanceOf(_recipient);
    require(_balance > 0);
    crowdsale.burnTokens(_recipient);
}

function migrate(address[] _recipients) public onlyOwner returns (bool) {
    for(uint i = 0; i < _recipients.length; i++) {
        _migrate(_recipients[i]);
    }
    return true;
}
```

Tokens of the starter contract will be burnt (when this contract address is set) and transferred to main contract (only owner can do this). See an example of this in examples/Example.sol

## Contributions

Contributions are welcome.

## Licence

GPL-v3.0
