require('truffle-test-utils').init();
import ether from './helpers/ether';
import { advanceBlock } from './helpers/advanceToBlock';
import EVMRevert from './helpers/EVMRevert';
const BigNumber = web3.BigNumber;
const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
const Token = artifacts.require('Crowdsale');

contract('Crowdsale', ([owner, wallet, investor, otherInvestor, outsider]) => {
  before(async () => {
    await advanceBlock();
  });

  beforeEach(async () => {
    this.crowdsale = await Token.new();
    this.crowdsale.setParams('TST', 'test', 18, 5000, { from: owner });
  });

  describe('init', () => {
    it('has an owner', async () => {
      assert.equal(await this.crowdsale.owner(), owner);
    });

    it('should set parameters', async () => {
      const rate = await this.crowdsale.rate();
      const symbol = await this.crowdsale.symbol();
      const tokenName = await this.crowdsale.tokenName();
      const decimals = await this.crowdsale.decimals();
      const totalSupply = await this.crowdsale.totalSupply();

      rate.should.be.bignumber.equal(5000);
      symbol.should.be.equal('TST');
      tokenName.should.be.bignumber.equal('test');
      decimals.should.be.bignumber.equal(18);
      totalSupply.should.be.bignumber.equal(0);
    });

    it('should set rate', async () => {
      await this.crowdsale.setRate(10, { from: owner })
      const rate = await this.crowdsale.rate();
      assert.equal(rate, 10);
    });

    it('should set whitelisting', async () => {
      await this.crowdsale.setWhitelisting({ from: owner })
      const doWhitelisting = await this.crowdsale.shouldWhitelist();
      assert.equal(doWhitelisting, true);
    });

    it('should unset whitelisting', async () => {
      await this.crowdsale.unsetWhitelisting({ from: owner })
      const doWhitelisting = await this.crowdsale.shouldWhitelist();
      assert.equal(doWhitelisting, true);
    });

    it('others can\'t set parameters', async () => {
      await this.crowdsale.setParams('TST', 'test', 18, 5000, { from: outsider }).should.be.rejectedWith(EVMRevert);
    });

    it('others can\'t set rates', async () => {
      await this.crowdsale.setRate(10, { from: outsider }).should.be.rejectedWith(EVMRevert);
    });

    it('others can\'t set whtelisting', async () => {
      await this.crowdsale.setWhitelisting({ from: outsider }).should.be.rejectedWith(EVMRevert);
    });

    it('others can\'t unset whtelisting', async () => {
      await this.crowdsale.unsetWhitelisting({ from: outsider }).should.be.rejectedWith(EVMRevert);
    });

    it('start ico', async () => {
      await this.crowdsale.startIco({ from: owner })
      const state = await this.crowdsale.icoState();
    });

    it('start event is in the logs', async () => {
      const { logs } = await this.crowdsale.startIco({ from: owner });
      const event = logs.find((e) => e.event === 'RunIco');
      should.exist(event);
    });

    it('pause ico', async () => {
      await this.crowdsale.pauseIco({ from: owner })
      const state = await this.crowdsale.icoState();
    });

    it('pause event is in the logs', async () => {
      const { logs } = await this.crowdsale.startIco({ from: owner });
      const event = logs.find((e) => e.event === 'PauseIco');
      should.exist(event);
    });

    it('finish ico', async () => {
      await this.crowdsale.pauseIco({ from: owner })
      const state = await this.crowdsale.icoState();
    });

    it('pause event is in the logs', async () => {
      const { logs } = await this.crowdsale.finishIco({ from: owner });
      const event = logs.find((e) => e.event === 'FinishIco');
      should.exist(event);
    });

    it('set bot', async () => {
      await this.crowdsale.setBot(otherInvestor, { from: owner })
      const bot = await this.crowdsale.bot();
      bot.should.be.bignumber.equal(otherInvestor);
    });

    it('bot cannot be set from non-owner', async () => {
      await this.crowdsale.setBot(otherInvestor, { from: otherInvestor }).should.be.rejectedWith(EVMRevert);
    });

    it('validate owner', async () => {
      await this.crowdsale.validate({ from: otherInvestor }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.validate({ from: owner }).should.be.fulfilled;
    });

    it('transfer ownership', async () => {
      await this.crowdsale.transferOwnership(investor, { from: otherInvestor }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.transferOwnership(investor, { from: owner }).should.be.fulfilled;
      const newOwner = this.crowdsale.owner();
      newOwner.should.be.bignumber.equal(owner);
    });
  });

  describe('sales conditions', () => {
    it('should accept payments if running', async () => {
      const { logs } = await this.crowdsale.startIco({ from: owner });
      await this.crowdsale.send(3.33).should.be.fulfilled;
      const event = logs.find((e) => e.event === 'Transfer');
      should.exist(event);
    });

    it('should reject payments if created', async () => {
      await this.crowdsale.send(1).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments if paused', async () => {
      await this.crowdsale.pauseIco({ from: owner })
      await this.crowdsale.send(1).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments if finished', async () => {
      const { logs } = await this.crowdsale.finishIco({ from: owner });
      await this.crowdsale.send(1).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('sales', () => {
    it('should generate correct balances', async () => {
      await this.crowdsale.startIco({ from: owner });
      const rate = await this.crowdsale.rate();
      const amount = ether(1);
      const expectedTokenAmount = rate.mul(amount);

      await this.crowdsale.send({ value: amount, from: investor }).should.be.fulfilled;
      (await this.crowdsale.balanceOf(investor)).should.be.bignumber.equal(expectedTokenAmount);
      (await this.crowdsale.balanceOf(owner)).should.be.bignumber.equal(0);
      (await this.crowdsale.totalSupply()).should.be.bignumber.equal(expectedTokenAmount);
      (await this.crowdsale.weiRaised()).should.be.bignumber.equal(amount);
      const ownerBalance = web3.eth.getBalance(owner);
      ownerBalance.should.be.bignumber.equal(amount);
    });
  });

  describe('whitelists', () => {
    beforeEach(async () => {
      await this.crowdsale.startIco({ from: owner });
      await this.crowdsale.setWhitelisting({ from: owner });
    });

    it('allow sales for rwhitelisted', async () => {
      await this.crowdsale.addToWhitelist(investor, { from: owner });
      (await this.crowdsale.send({ value: 1, from: investor })).should.be.fulfilled;
    });

    it('not allow to whitelist from non-owners', async () => {
      (await this.crowdsale.addToWhitelist(investor, { from: otherInvestor })).should.be.rejectedWith(EVMRevert);
    });

    it('not allow non-whitelisted people to participate', async () => {
      (await this.crowdsale.send({ { value: 1, from: investor })).should.be.rejectedWith(EVMRevert);
    });

    it('add to whitelist', async () => {
      (await this.crowdsale.addToWhitelist(investor, { from: owner })).should.be.fulfilled;;
      const status = await this.crowdsale.getWhitelistStatus(investor, { from: owner });
      status.should.equal(true);
    });

    it('add many to whitelist', async () => {
      const investors = [
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
      ]
      (await this.crowdsale.addManyToWhitelist(investors, { from: owner })).should.be.fulfilled;;
    });

    it('remove from whitelist', async () => {
      (await this.crowdsale.addToWhitelist(investor, { from: owner })).should.be.fulfilled;;
      (await this.crowdsale.removeFromWhitelist(investor, { from: owner })).should.be.fulfilled;;
      const status = await this.crowdsale.getWhitelistStatus(investor, { from: owner });
      status.should.equal(false);
    });

    it('not allow to remove from whitelist fro non-owners', async () => {
      (await this.crowdsale.addToWhitelist(investor, { from: owner })).should.be.fulfilled;;
      (await this.crowdsale.removeFromWhitelist(investor, { from: otherInvestor })).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('transfers allowance', () => {
    it('allow transfers', async () => {
      await this.corwdsale.allowTransfers({ from: owner });
      const allowed = this.crowdsale.transfersNotAllowed()
      allowed.should.be.equal(true);
    });

    it('disallow transfers when running ICO', async () => {
      await this.crowdsale.startIco({ from: owner });
      await this.crowdsale.send({ value: 10, from: owner });
      await this.crowdsale.allowTransfers({ from: owner });
      const allowed = this.crowdsale.transfersNotAllowed();
      allowed.should.be.equal(false);
      await this.token.transfer(anoth, 1, { from: owner }).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('transfers', () => {
    beforeEach(async () => {
      await this.crowdsale.startIco({ from: owner });
      const ethers = ether(100);
      const rate = this.crowdsale.rate();
      this.initial = ethers.mul(rate);
      (await this.crowdsale.send({ value: ethers, from: investor })).should.be.fulfilled;;
      (await this.corwdsale.allowTransfers({ from: owner })).should.be.fulfilled;;
    });

    it('transfers the requested amount', async () => {
      const amount = 1110;
      await this.token.transfer(otherInvestor, amount, { from: investor });
  
      const senderBalance = await this.token.balanceOf(investor);
      assert.equal(senderBalance, (this.initial - amount));
  
      const recipientBalance = await this.token.balanceOf(otherInvestor);
      assert.equal(recipientBalance, amount);
    });

    it('burn tokens', async () => {
      let balance
      balance = await this.token.balanceOf(investor);
      assert.equal(balance, this.initial);
      await this.token.burnTokens(investor, { from: owner });
      balance = await this.token.balanceOf(investor);
      assert.equal(balance, 0);
    });

    it('owner withdraw', async () => {
      await this.token.withdraw().should.be.fulfilled;
    });

    it('safe tokens reclaim', async () => {
      await this.token.reclaimToken(investor, { from: owner }).should.be.fulfilled;
    });

    it('should revert transfer if owner has no tokens', async () => {
      await assertRevert(this.token.transfer(recipient, (this.initial + 1), { from: investor }));
    });
  
    it('emits a transfer event', async () => {
      const amount = 1;
      const { logs } = await this.token.transfer(otherInvestor, amount, { from: investor });
  
      assert.equal(logs.length, 1);
      assert.equal(logs[0].event, 'Transfer');
      assert.equal(logs[0].args.from, owner);
      assert.equal(logs[0].args.to, recipient);
      assert(logs[0].args.value.eq(amount));
    });
  
    it('reverts transfer if recipient is zero', async () => {
      await assertRevert(this.token.transfer('0x0000000000000000000000000000000000000000', 1, { from: investor }));
    });
  });

  describe('foreign buys', () => {
    it('should generate correct balances for foreign buys', async () => {
      await this.crowdsale.startIco({ from: owner });
      const rate = await this.crowdsale.rate();
      const amount = ether(1);
      const expectedTokenAmount = rate.mul(amount);
      await this.crowdsale.setBot(otherInvestor, { from: owner })
      const bot = await this.crowdsale.bot();
      const tx = '0000000000000000002f6724320130e0bd460e97cfda6ef6b5748de931dd16af';
      await this.crowdsale.foreignBuy(investor, expectedTokenAmount, tx, { from: bot }).should.be.fulfilled;
      (await this.crowdsale.balanceOf(investor)).should.be.bignumber.equal(expectedTokenAmount);
    });
  });
