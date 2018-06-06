import ether from './helpers/ether';
const BigNumber = web3.BigNumber;
require('chai').use(require('chai-as-promised')).use(require('chai-bignumber')(BigNumber)).should();
const Token = artifacts.require('Crowdsale');

contract('Crowdsale', ([owner, wallet, investor, otherInvestor]) => {
  describe('init', () => {
    it('has an owner', async () => {
      const crowdsale = await Token.new();
      const originalOwner = await crowdsale.owner();
      originalOwner.should.equal(owner);
    });

    it('should set correct parameters', async () => {
      const crowdsale = await Token.new();
      await crowdsale.setParams('TSET', 'test2', 18, 3000, { from: owner, gas: 1000000 });
      const rate = await crowdsale.rate();
      const symbol = web3.toUtf8(await crowdsale.symbol());
      const tokenName = web3.toUtf8(await crowdsale.tokenName());
      const decimals = await crowdsale.decimals();
      const totalSupply = await crowdsale.totalSupply();

      rate.should.be.bignumber.equal(3000);
      symbol.should.be.equal('TSET');
      tokenName.should.be.equal('test2');
      decimals.should.be.bignumber.equal(18);
      totalSupply.should.be.bignumber.equal(0);
    });

    it('should set rate', async () => {
      const crowdsale = await Token.new();
      await crowdsale.setRate(10, { from: owner, gas: 1000000 });
      const rate = await crowdsale.rate();
      rate.should.be.bignumber.equal(10);
    });

    it('multiple set rates', async () => {
      const crowdsale = await Token.new();
      await crowdsale.setRate(10, { from: owner, gas: 1000000 });
      await crowdsale.setRate(1000, { from: owner, gas: 1000000 });
      const rate = await crowdsale.rate();
      rate.should.be.bignumber.equal(1000);
    });

    it('should not require whitelisting at default', async () => {
      const crowdsale = await Token.new();
      const doWhitelisting = await crowdsale.shouldWhitelist();
      doWhitelisting.should.be.equal(false);
    });

    it('should set whitelisting', async () => {
      const crowdsale = await Token.new();
      await crowdsale.setWhitelisting({ from: owner, gas: 1000000 });
      const doWhitelisting = await crowdsale.shouldWhitelist();
      doWhitelisting.should.be.equal(true);
    });

    it('should unset whitelisting', async () => {
      const crowdsale = await Token.new();
      await crowdsale.setWhitelisting({ from: owner, gas: 1000000 });
      await crowdsale.unsetWhitelisting({ from: owner, gas: 1000000 });
      const doWhitelisting = await crowdsale.shouldWhitelist();
      doWhitelisting.should.be.equal(false);
    });

    it('default ico state should be Created (=0)', async () => {
      const crowdsale = await Token.new();
      await crowdsale.setParams('TST', 'test', 18, 333, { from: owner, gas: 1000000 });
      const state = await crowdsale.icoState();
      state.should.be.bignumber.equal(0);
    });

    it('start ico when state is Created', async () => {
      let state;
      const crowdsale = await Token.new();
      state = await crowdsale.icoState();
      state.should.be.bignumber.equal(0);
      await crowdsale.startIco({ from: owner, gas: 1000000 });
      state = await crowdsale.icoState();
      state.should.be.bignumber.equal(1);
    });

    it('start ico when state is Paused', async () => {
      let state;
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner, gas: 1000000 });
      await crowdsale.pauseIco({ from: owner, gas: 1000000 });
      state = await crowdsale.icoState();
      state.should.be.bignumber.equal(2);
      await crowdsale.startIco({ from: owner, gas: 1000000 });
      state = await crowdsale.icoState();
      state.should.be.bignumber.equal(1);
    });

    it('not to allow to start ico when state is Finished', async () => {
      let state;
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner, gas: 1000000 });
      await crowdsale.finishIco({ from: owner, gas: 1000000 });
      state = await crowdsale.icoState();
      state.should.be.bignumber.equal(3);
      const error = await crowdsale.startIco({ from: owner }).catch((e) => e);
      error.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('start event is in the logs', async () => {
      const crowdsale = await Token.new();
      const { logs } = (await crowdsale.startIco({ from: owner, gas: 1000000 }));
      logs[0].event.should.be.equal('RunIco');
    });

    it('pause ico', async () => {
      let state;
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner, gas: 1000000 });
      state = await crowdsale.icoState();
      state.should.be.bignumber.equal(1);
      await crowdsale.pauseIco({ from: owner, gas: 1000000 });
      state = await crowdsale.icoState();
      state.should.be.bignumber.equal(2);
    });

    it('pause event is in the logs', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner, gas: 1000000 });
      const { logs } = await crowdsale.pauseIco({ from: owner, gas: 1000000 });
      logs[0].event.should.be.equal('PauseIco');
    });

    it('finish ico when running', async () => {
      let state;
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner, gas: 1000000 });
      state = await crowdsale.icoState();
      state.should.be.bignumber.equal(1);
      await crowdsale.finishIco({ from: owner, gas: 1000000 });
      state = await crowdsale.icoState();
      state.should.be.bignumber.equal(3);
    });

    it('finish ico when paused', async () => {
      let state;
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner, gas: 1000000 });
      await crowdsale.pauseIco({ from: owner, gas: 1000000 });
      state = await crowdsale.icoState();
      state.should.be.bignumber.equal(2);
      await crowdsale.finishIco({ from: owner, gas: 1000000 });
      state = await crowdsale.icoState();
      state.should.be.bignumber.equal(3);
    });

    it('finish event is in the logs', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner, gas: 1000000 });
      const { logs } = await crowdsale.finishIco({ from: owner, gas: 1000000 });
      logs[0].event.should.be.equal('FinishIco');
    });

    it('set bot', async () => {
      const crowdsale = await Token.new();
      await crowdsale.setBot(otherInvestor, { from: owner, gas: 1000000 });
      const bot = await crowdsale.bot();
      bot.should.be.equal(otherInvestor);
    });

    it('bot cannot be set from non-owner', async () => {
      const crowdsale = await Token.new();
      const error = await crowdsale.setBot(otherInvestor, { from: otherInvestor, gas: 6000000 }).catch((e) => e);
      error.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('owner cannot be set from non-owner', async () => {
      const crowdsale = await Token.new();
      const error = await crowdsale.transferOwnership(otherInvestor, { from: otherInvestor, gas: 6000000 }).catch((e) => e);
      error.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('rate cannot be set from non-owner', async () => {
      const crowdsale = await Token.new();
      const error = await crowdsale.setRate(1000000, { from: otherInvestor, gas: 6000000 }).catch((e) => e);
      error.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('validate owner', async () => {
      const crowdsale = await Token.new();
      let isOwner;
      isOwner = await crowdsale.validate({ from: otherInvestor });
      isOwner.should.be.equal(false);
      isOwner = await crowdsale.validate({ from: owner });
      isOwner.should.be.equal(true);
    });

    it('transfer ownership', async () => {
      const crowdsale = await Token.new();
      const error = await crowdsale.transferOwnership(investor, { from: otherInvestor, gas: 6000000 }).catch((e) => e);
      error.message.should.be.equal('VM Exception while processing transaction: revert');
      await crowdsale.transferOwnership(investor, { from: owner, gas: 1000000 });
      const newOwner = await crowdsale.owner();
      newOwner.should.be.equal(investor);
    });

    it('should guard ownership against stuck state', async function () {
      const crowdsale = await Token.new();
      let originalOwner = await crowdsale.owner();
      const error = await crowdsale.transferOwnership(null, { from: originalOwner, gas: 1000000 }).catch((e) => e);
      error.message.should.be.equal('VM Exception while processing transaction: revert');
    });
  });

  describe('sales conditions', () => {
    it('should accept payments when running', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      const { logs } = await crowdsale.sendTransaction({ from: investor, gas: 1000000, value: ether(3) });
      logs[0].event.should.be.equal('Transfer');
    });

    it('owner cannt pruchase', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      const logs = await crowdsale.sendTransaction({ from: owner, gas: 1000000, value: ether(3) }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('should reject payments if just cretaed', async () => {
      const crowdsale = await Token.new();
      const logs = await crowdsale.sendTransaction({ from: investor, gas: 1000000, value: ether(6) }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('should reject payments when paused', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner, gas: 1000000 });
      await crowdsale.pauseIco({ from: owner, gas: 1000000 });
      const state = await crowdsale.icoState();
      state.should.be.bignumber.equal(2);
      const logs = await crowdsale.sendTransaction({ from: investor, gas: 1000000, value: ether(6) }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('should reject payments when finished', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner, gas: 1000000 });
      await crowdsale.finishIco({ from: owner, gas: 1000000 });
      const state = await crowdsale.icoState();
      state.should.be.bignumber.equal(3);
      const logs = await crowdsale.sendTransaction({ from: investor, gas: 1000000, value: ether(6) }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });
  });

  describe('sales', () => {
    it('should generate correct balances', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      const rate = await crowdsale.rate();
      const amount = ether(11);
      const expectedTokenAmount = rate.mul(amount);

      await crowdsale.sendTransaction({ from: investor, value: amount });
      const investorBalance = await crowdsale.balanceOf(investor);
      investorBalance.toNumber().should.be.bignumber.equal(expectedTokenAmount.toNumber());
      const ownerBaance = await crowdsale.balanceOf(owner);
      ownerBaance.should.be.bignumber.equal(0);
      const supply = await crowdsale.totalSupply();
      supply.toNumber().should.equal(expectedTokenAmount.toNumber());
      const weiRaised = await crowdsale.weiRaised();
      weiRaised.toNumber().should.equal(amount.toNumber());
    });

    it('should generate correct balances when multi purchasing', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      const rate = await crowdsale.rate();
      let amount = 0;
      let expectedTokenAmount = 0;

      for (let i = 1; i <= 50; i++) {
        amount += ether(i) / 100;
        expectedTokenAmount += rate * ether(i) / 100;
        await crowdsale.sendTransaction({ from: investor, value: (ether(i) / 100) });
      }

      const investorBalance = await crowdsale.balanceOf(investor);
      const supply = await crowdsale.totalSupply();
      const weiRaised = await crowdsale.weiRaised();

      investorBalance.toNumber().should.be.bignumber.equal(expectedTokenAmount);
      supply.toNumber().should.equal(expectedTokenAmount);
      weiRaised.toNumber().should.equal(amount);
    });
  });

  describe('whitelists', () => {
    it('allow sales for rwhitelisted', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      await crowdsale.setWhitelisting({ from: owner });
      await crowdsale.addToWhitelist(investor, { from: owner });
      const { logs } = await crowdsale.sendTransaction({ from: investor, value: ether(4) });
      logs[0].event.should.be.equal('Transfer');
    });

    it('not allow to whitelist from non-owners', async () => {
      const crowdsale = await Token.new();
      const logs = await crowdsale.addToWhitelist(investor, { from: otherInvestor }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('not allow non-whitelisted people to participate', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      await crowdsale.setWhitelisting({ from: owner });
      const logs = await crowdsale.sendTransaction({ from: investor, value: ether(4) }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('add to whitelist', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      await crowdsale.addToWhitelist(investor, { from: owner });
      const status = await crowdsale.getWhitelistStatus(investor, { from: owner });
      status.should.equal(true);
    });

    it('add many to whitelist', async () => {
      const crowdsale = await Token.new();
      const recipients = [
        '0x6f41fffc0338e715e8aac4851afc4079b712af70',
        '0xad8926fdb14c2ca283ab1e8a05c0b6707bc03f97',
        '0x1cb0ff92ec067169fd6b1b12c6d39a4f6c2cf6f9',
        '0x594b70524993798cb093ca8a2bd7f02f904b66d3',
        '0x2f1ee0930f00b0f3cdab66d916cbd1fa4fe9535a',
        '0x5513a551c5aafaa8719a0df5bf398d4b3af4e211',
        '0xa1bf121993c23cc467eec8b7e453011dae250404',
        '0xe0b161979ebca95235c4cfeddfd11fb30d782a4d',
        '0x093b30604ac41e054e71b670d8e3ab68360017c9',
        '0x1cac60d851a44305d7dd6ecf8ff32f3403427d3d'
      ];
      await crowdsale.addManyToWhitelist(recipients, { from: owner });

      for (let i = 0; i < recipients.length; i++) {
        const status = await crowdsale.getWhitelistStatus(recipients[i], { from: owner });
        status.should.equal(true);
      }
    });

    it('remove from whitelist', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      await crowdsale.addToWhitelist(investor, { from: owner });
      await crowdsale.removeFromWhitelist(investor, { from: owner });
      const status = await crowdsale.getWhitelistStatus(investor, { from: owner });
      status.should.equal(false);
    });

    it('not allow to remove from whitelist for non-owners', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      await crowdsale.addToWhitelist(investor, { from: owner });
      const logs = await crowdsale.removeFromWhitelist(investor, { from: otherInvestor }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });
  });

  describe('transfers allowance', () => {
    it('allow transfers', async () => {
      const crowdsale = await Token.new();
      await crowdsale.allowTransfers({ from: owner });
      const allowed = await crowdsale.transfersAllowed();
      allowed.should.be.equal(true);
    });

    it('disable transfers', async () => {
      const crowdsale = await Token.new();
      await crowdsale.allowTransfers({ from: owner });
      await crowdsale.disableTransfers({ from: owner });
      const allowed = await crowdsale.transfersAllowed();
      allowed.should.be.equal(false);
    });

    it('not allow disabling tanfers when they are disabled', async () => {
      const crowdsale = await Token.new();
      await crowdsale.allowTransfers({ from: owner });
      await crowdsale.disableTransfers({ from: owner });
      const logs = await crowdsale.disableTransfers({ from: owner }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('not allow enabling tanfers when they are enabled', async () => {
      const crowdsale = await Token.new();
      await crowdsale.allowTransfers({ from: owner });
      const logs = await crowdsale.allowTransfers({ from: owner }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('disallow transfers when running ICO', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      await crowdsale.sendTransaction({ from: investor, value: ether(400) });
      const allowed = await crowdsale.transfersAllowed();
      allowed.should.be.equal(false);
      const logs = await crowdsale.transfer(otherInvestor, 100, { from: investor }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('disallow transfers when paused ICO', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      await crowdsale.sendTransaction({ from: investor, value: ether(400) });
      await crowdsale.pauseIco({ from: owner });
      const allowed = await crowdsale.transfersAllowed();
      allowed.should.be.equal(false);
      const logs = await crowdsale.transfer(otherInvestor, 100, { from: investor }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('allow transfers after finish', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      await crowdsale.sendTransaction({ from: investor, value: ether(400) });
      await crowdsale.finishIco({ from: owner });
      const allowed = await crowdsale.transfersAllowed();
      allowed.should.be.equal(true);
      const { logs } = await crowdsale.transfer(otherInvestor, 100, { from: investor });
      logs[0].event.should.be.equal('Transfer');
    });

    it('allow transfers when enabled and running ico', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      await crowdsale.sendTransaction({ from: investor, value: ether(400) });
      await crowdsale.allowTransfers({ from: owner });
      const allowed = await crowdsale.transfersAllowed();
      allowed.should.be.equal(true);
      const { logs } = await crowdsale.transfer(otherInvestor, 100, { from: investor });
      logs[0].event.should.be.equal('Transfer');
    });

    it('allow transfers when enabled and paused ico', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      await crowdsale.sendTransaction({ from: investor, value: ether(400) });
      await crowdsale.pauseIco({ from: owner });
      await crowdsale.allowTransfers({ from: owner });
      const allowed = await crowdsale.transfersAllowed();
      allowed.should.be.equal(true);
      const { logs } = await crowdsale.transfer(otherInvestor, 100, { from: investor });
      logs[0].event.should.be.equal('Transfer');
    });
  });

  describe('foreign buys', () => {
    it('should generate correct balances for foreign buys', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      const rate = await crowdsale.rate();
      const amount = ether(1);
      const expectedTokenAmount = rate.mul(amount);
      await crowdsale.setBot(otherInvestor, { from: owner })
      const bot = await crowdsale.bot();
      const tx = '0000000000000000002f6724320130e0bd460e97cfda6ef6b5748de931dd16af';
      await crowdsale.foreignBuy(investor, expectedTokenAmount, tx, { from: bot });
      const balance = await crowdsale.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });
  });

  describe('transfers', () => {
    it('transfers the requested amount', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      const ethers = ether(100);
      const rate = await crowdsale.rate();
      const initial = ethers.mul(rate);
      await crowdsale.sendTransaction({ from: investor, gas: 1000000, value: ethers });
      await crowdsale.allowTransfers({ from: owner });
      const amount = 1110;
      await crowdsale.transfer(otherInvestor, amount, { from: investor });
      const senderBalance = await crowdsale.balanceOf(investor);
      senderBalance.toNumber().should.be.equal(initial - amount);
      const recipientBalance = await crowdsale.balanceOf(otherInvestor);
      recipientBalance.toNumber().should.be.equal(amount);
    });

    it('burn tokens', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      const ethers = ether(100);
      const rate = await crowdsale.rate();
      const initial = ethers.mul(rate);
      await crowdsale.sendTransaction({ from: investor, gas: 1000000, value: ethers });
      let balance
      balance = await crowdsale.balanceOf(investor);
      balance.toNumber().should.be.equal(initial.toNumber());
      await crowdsale.burnTokens(investor, { from: owner });
      balance = await crowdsale.balanceOf(investor);
      balance.toNumber().should.be.equal(0);
    });

    it('not allw to burn tokens for outsiders', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      const ethers = ether(100);
      const rate = await crowdsale.rate();
      const initial = ethers.mul(rate);
      await crowdsale.sendTransaction({ from: investor, gas: 1000000, value: ethers });
      let balance;
      balance = await crowdsale.balanceOf(investor);
      balance.toNumber().should.be.equal(initial.toNumber());
      const logs = await crowdsale.burnTokens(investor, { from: otherInvestor }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
      balance = await crowdsale.balanceOf(investor);
      balance.toNumber().should.be.equal(initial.toNumber());
    });

    it('owner withdraw', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      const ethers = ether(100);
      const initialBalance = web3.eth.getBalance(owner);
      await crowdsale.sendTransaction({ from: investor, value: ethers });
      await crowdsale.withdraw({ from: owner });
      const finalBalance = web3.eth.getBalance(owner);
      const expected = initialBalance.add(ethers);
      (Math.round(finalBalance.toNumber() / 10 ** 18)).should.be.equal(Math.round(expected.toNumber() / 10 ** 18));
    });

    it('not allow to withdraw for non owners', async () => {
      const crowdsale = await Token.new();
      const logs = await crowdsale.withdraw({ from: otherInvestor }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('should revert transfer if owner has no tokens', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      await crowdsale.finishIco({ from: owner });
      const logs = await crowdsale.transfer(investor, 1, { from: investor }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('emits a transfer event', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      const ethers = ether(2.333333333);
      const rate = await crowdsale.rate();
      const tokens = ethers.mul(rate);
      await crowdsale.sendTransaction({ from: investor, gas: 1000000, value: ethers });
      await crowdsale.finishIco({ from: owner });
      const { logs } = await crowdsale.transfer(otherInvestor, tokens, { from: investor });
      logs[0].event.should.be.equal('Transfer');
      logs[0].args.from.should.be.equal(investor);
      logs[0].args.to.should.be.equal(otherInvestor);
      logs[0].args.value.toNumber().should.be.equal(tokens.toNumber());
    });

    it('reverts transfer if recipient is zero', async () => {
      const crowdsale = await Token.new();
      const z = '0x0000000000000000000000000000000000000000';
      await crowdsale.startIco({ from: owner });
      let logs
      logs = await crowdsale.sendTransaction({ from: z, gas: 1000000, value: ether(1) }).catch((e) => e);
      logs.message.should.be.equal('sender account not recognized');
      await crowdsale.finishIco({ from: owner });
      logs = await crowdsale.transfer(z, 1, { from: investor }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('reverts transfer if recipient is null', async () => {
      const crowdsale = await Token.new();
      const z = null;
      await crowdsale.startIco({ from: owner });
      let logs
      logs = await crowdsale.sendTransaction({ from: z, gas: 1000000, value: ether(1) }).catch((e) => e);
      logs.message.should.be.equal('invalid address');
      await crowdsale.finishIco({ from: owner });
      logs = await crowdsale.transfer(z, 1, { from: investor }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('reverts transfer if sending zero', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      let logs
      logs = await crowdsale.sendTransaction({ from: investor, gas: 1000000, value: ether(0) }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
      await crowdsale.finishIco({ from: owner });
      logs = await crowdsale.transfer(otherInvestor, 0, { from: investor }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('reverts transfer if sending below zero', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      await crowdsale.sendTransaction({ from: investor, gas: 1000000, value: ether(100) });
      await crowdsale.finishIco({ from: owner });
      const logs = await crowdsale.transfer(otherInvestor, -1, { from: investor }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('reverts transfer if sending overflow', async () => {
      const crowdsale = await Token.new();
      await crowdsale.startIco({ from: owner });
      await crowdsale.sendTransaction({ from: investor, gas: 1000000, value: ether(100) });
      await crowdsale.finishIco({ from: owner });
      const logs = await crowdsale.transfer(otherInvestor, (2**256), { from: investor }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });
  });

  describe('allowances', () => {
    it('approve transfer', async () => {
      const crowdsale = await Token.new();
      const { logs } = await crowdsale.approve(investor, 1000, { from: otherInvestor });
      logs[0].event.should.be.equal('Approval');
      const value = await crowdsale.allowance(otherInvestor, investor);
      value.should.be.bignumber.equal(1000);
    });

    it('increase approveal fortransfer', async () => {
      const crowdsale = await Token.new();
      await crowdsale.approve(investor, 1000, { from: otherInvestor });
      await crowdsale.increaseApproval(investor, 1000, { from: otherInvestor });
      const value = await crowdsale.allowance(otherInvestor, investor);
      value.should.be.bignumber.equal(2000);
    });

    it('decreaase approval for transfer', async () => {
      const crowdsale = await Token.new();
      await crowdsale.approve(investor, 1000, { from: otherInvestor });
      await crowdsale.decreaseApproval(investor, 100, { from: otherInvestor });
      const value = await crowdsale.allowance(otherInvestor, investor);
      value.should.be.bignumber.equal(900);
    });
  });

  describe('transfer from', () => {
    it('allow transfer from', async () => {
      const spender = otherInvestor;
      const crowdsale = await Token.new();
      await crowdsale.approve(spender, 1000, { from: investor });
      const value = await crowdsale.allowance(investor, spender);
      value.should.be.bignumber.equal(1000);
      await crowdsale.startIco({ from: owner });
      await crowdsale.sendTransaction({ from: investor, gas: 1000000, value: ether(300) });
      const initialBalance = await crowdsale.balanceOf(investor);
      await crowdsale.finishIco({ from: owner });
      const expected = initialBalance - 111;
      const { logs } = await crowdsale.transferFrom(investor, spender, 111, { from: spender });
      logs[0].event.should.be.equal('Transfer');
      logs[0].args.from.should.be.equal(investor);
      logs[0].args.to.should.be.equal(spender);
      logs[0].args.value.toNumber().should.be.equal(111);
      const investorBalance = await crowdsale.balanceOf(investor);
      const spenderBalance = await crowdsale.balanceOf(spender);
      investorBalance.toNumber().should.be.equal(expected);
      spenderBalance.toNumber().should.be.equal(111);
    });
  });
});
