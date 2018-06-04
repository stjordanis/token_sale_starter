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
});
