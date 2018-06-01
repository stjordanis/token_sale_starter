require('truffle-test-utils').init();
import ether from './helpers/ether';
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert';
const BigNumber = web3.BigNumber;
const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
const PowerPiperCrowdsale = artifacts.require('PowerPiperCrowdsale');
const PowerPiperToken = artifacts.require('PowerPiperToken');
const RefundVault = artifacts.require('RefundVault');

/*
@TODO test sending ether to token/ crowdsale addresses
*/
contract('PowerPiperCrowdsale', function ([owner, wallet, investor, otherInvestor, outsider]) {
  const RATE = new BigNumber(3000);
  const GOAL = ether(10);
  const CAP = ether(800);
  const LESS_THAN_CAP = ether(19.99);
  const LESS_THAN_GOAL = ether(0.1);
  const INITIAL_TOKENS = RATE.mul(CAP)

  before(async function () {
    await advanceBlock();
  });

  describe('basic', function () {
    it('has an owner', async function () {
      assert.equal(await this.crowdsale.owner(), owner);
    });

    it('should fail with zero cap', async function () {
      await PowerPiperCrowdsale.new(
        this.openingTime, this.closingTime, RATE, 0, wallet, this.token.address, GOAL
      ).should.be.rejectedWith(EVMRevert);
    });

    it('should fail with zero goal', async function () {
      await PowerPiperCrowdsale.new(
        this.openingTime, this.closingTime, RATE, CAP, wallet, this.token.address, 0
      ).should.be.rejectedWith(EVMRevert);
    });

    it('should fail with cap > goal', async function () {
      await PowerPiperCrowdsale.new(
        this.openingTime, this.closingTime, RATE, CAP, wallet, this.token.address, (CAP * 2)
      ).should.be.rejectedWith(EVMRevert);
    });
  });

  beforeEach(async function () {
    this.openingTime = latestTime() + duration.weeks(1);
    this.closingTime = this.openingTime + duration.weeks(1);
    this.afterClosingTime = this.closingTime + duration.seconds(12000);

    this.token = await PowerPiperToken.new(INITIAL_TOKENS, { from: owner });
    this.vault = await RefundVault.new(wallet, { from: owner });
    this.crowdsale = await PowerPiperCrowdsale.new(
      this.openingTime, this.closingTime, RATE, CAP, wallet, this.token.address, GOAL
    );
    await this.token.transferOwnership(this.crowdsale.address);
    await this.vault.transferOwnership(this.crowdsale.address);
  });

  /* it('should log purchase', async function () {
    const value = ether(1.11);
    const { logs } = await this.crowdsale.buyTokens(investor, { value: value, from: investor });
    const event = logs.find(e => e.event === 'TokenPurchase');
    should.exist(event);
    event.args.purchaser.should.equal(investor);
    event.args.beneficiary.should.equal(investor);
    event.args.value.should.be.bignumber.equal(value);
    event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
  });

  it('should assign tokens to sender', async function () {
    const value = ether(500.0000000001);
    await increaseTimeTo(this.openingTime);
    await this.crowdsale.buyTokens(investor, { value: value, from: investor });
    let balance = await this.token.balanceOf(investor);
    balance.should.be.bignumber.equal(expectedTokenAmount);
  });

  it('should forward funds to wallet', async function () {
    const value = ether(0.0000000001);
    await increaseTimeTo(this.openingTime);
    const pre = web3.eth.getBalance(wallet);
    await this.crowdsale.buyTokens(investor, { value: value, from: investor });
    const post = web3.eth.getBalance(wallet);
    post.minus(pre).should.be.bignumber.equal(value);
  }) */

  /* describe('vault basic', function () {
    const value = 3.33333333333;

    it('should accept contributions', async function () {
      await this.vault.deposit(owner, { value: value, from: investor }).should.be.fulfilled;
    });

    it('should not refund contribution during active state', async function () {
      await this.vault.deposit(owner, { value: value, from: investor });
      await this.vault.refund(owner).should.be.rejectedWith(EVMRevert);
    });

    it('only owner can enter refund mode', async function () {
      await this.vault.enableRefunds({ from: _ }).should.be.rejectedWith(EVMRevert);
      await this.vault.enableRefunds({ from: owner }).should.be.fulfilled;
    });

    it('should refund contribution after entering refund mode', async function () {
      await this.vault.deposit(investor, { value: value, from: owner });
      await this.vault.enableRefunds({ from: owner });

      const pre = web3.eth.getBalance(investor);
      await this.vault.refund(investor);
      const post = web3.eth.getBalance(investor);

      post.minus(pre).should.be.bignumber.equal(value);
    });

    it('only owner can close', async function () {
      await this.vault.close({ from: _ }).should.be.rejectedWith(EVMRevert);
      await this.vault.close({ from: owner }).should.be.fulfilled;
    });

    it('should forward funds to wallet after closing', async function () {
      await this.vault.deposit(investor, { value, from: owner });

      const pre = web3.eth.getBalance(wallet);
      await this.vault.close({ from: owner });
      const post = web3.eth.getBalance(wallet);

      post.minus(pre).should.be.bignumber.equal(value);
    });
  });

  describe('vault integrated', function () {
  }) */

  describe('finalizations', function () {
    it('cannot be finalized before ending', async function () {
      await this.crowdsale.finalize({ from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('cannot be finalized by third party after ending', async function () {
      await increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.finalize({ from: outsider }).should.be.rejectedWith(EVMRevert);
    });

    it('can be finalized by owner after ending', async function () {
      await increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.finalize({ from: owner }).should.be.fulfilled;
    });

    it('cannot be finalized twice', async function () {
      await increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.finalize({ from: owner });
      await this.crowdsale.finalize({ from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('logs finalized', async function () {
      await increaseTimeTo(this.afterClosingTime);
      const { logs } = await this.crowdsale.finalize({ from: owner });
      const event = logs.find(e => e.event === 'Finalized');
      should.exist(event);
    });
  });

  describe('cap', function () {
    it('should accept payments within cap', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.send(CAP.minus(LESS_THAN_CAP)).should.be.fulfilled;
      await this.crowdsale.send(LESS_THAN_CAP).should.be.fulfilled;
    });

    it('should reject payments outside cap', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.send(CAP);
      await this.crowdsale.send(1).should.be.rejectedWith(EVMRevert);
    });

    it('should not reach cap if sent under cap', async function () {
      await increaseTimeTo(this.openingTime);
      let capReached = await this.crowdsale.capReached();
      capReached.should.equal(false);
      await this.crowdsale.send(LESS_THAN_CAP);
      capReached = await this.crowdsale.capReached();
      capReached.should.equal(false);
    });

    it('should not reach cap if sent just under cap', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.send(CAP.minus(1));
      let capReached = await this.crowdsale.capReached();
      capReached.should.equal(false);
    });

    it('should reach cap if cap sent', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.send(CAP);
      let capReached = await this.crowdsale.capReached();
      capReached.should.equal(true);
    });

    it('should reject payments that exceed cap', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.send(CAP.plus(1)).should.be.rejectedWith(EVMRevert);
    });
  });

  it('should create crowdsale with correct parameters', async function () {
    this.crowdsale.should.exist;
    this.token.should.exist;

    const openingTime = await this.crowdsale.openingTime();
    const closingTime = await this.crowdsale.closingTime();
    const rate = await this.crowdsale.rate();
    const walletAddress = await this.crowdsale.wallet();
    const goal = await this.crowdsale.goal();
    const cap = await this.crowdsale.cap();

    openingTime.should.be.bignumber.equal(this.openingTime);
    closingTime.should.be.bignumber.equal(this.closingTime);
    rate.should.be.bignumber.equal(RATE);
    walletAddress.should.be.equal(wallet);
    goal.should.be.bignumber.equal(GOAL);
    cap.should.be.bignumber.equal(CAP);
  });

  it('should not accept payments before start', async function () {
    await this.crowdsale.send(ether(1)).should.be.rejectedWith(EVMRevert);
    await this.crowdsale.buyTokens(investor, { from: investor, value: ether(1) }).should.be.rejectedWith(EVMRevert);
  });

  it('should accept payments during the sale', async function () {
    const investmentAmount = ether(1);
    const expectedTokenAmount = RATE.mul(investmentAmount);
    await increaseTimeTo(this.openingTime);
    await this.crowdsale.buyTokens(investor, { value: investmentAmount, from: investor }).should.be.fulfilled;
    (await this.token.balanceOf(investor)).should.be.bignumber.equal(expectedTokenAmount);
    (await this.token.totalSupply()).should.be.bignumber.equal(INITIAL_TOKENS);
  });

  it('should reject payments after end', async function () {
    await increaseTimeTo(this.afterClosingTime);
    await this.crowdsale.send(ether(1)).should.be.rejectedWith(EVMRevert);
    await this.crowdsale.buyTokens(investor, { value: ether(1), from: investor }).should.be.rejectedWith(EVMRevert);
  });

  it('should reject payments over cap', async function () {
    await increaseTimeTo(this.openingTime);
    await this.crowdsale.send(CAP);
    await this.crowdsale.send(1).should.be.rejectedWith(EVMRevert);
  });

  it('should allow finalization and transfer funds to wallet if the goal is reached', async function () {
    await increaseTimeTo(this.openingTime);
    await this.crowdsale.send(GOAL);

    const beforeFinalization = web3.eth.getBalance(wallet);
    await increaseTimeTo(this.afterClosingTime);
    await this.crowdsale.finalize({ from: owner });
    const afterFinalization = web3.eth.getBalance(wallet);

    afterFinalization.minus(beforeFinalization).should.be.bignumber.equal(GOAL);
  });

  it('should allow refunds if the goal is not reached', async function () {
    const balanceBeforeInvestment = web3.eth.getBalance(investor);
    await increaseTimeTo(this.openingTime);
    await this.crowdsale.sendTransaction({ value: LESS_THAN_GOAL, from: investor, gasPrice: 0 });
    await increaseTimeTo(this.afterClosingTime);
    await this.crowdsale.finalize({ from: owner });
    await this.crowdsale.claimRefund({ from: investor, gasPrice: 0 }).should.be.fulfilled;
    const balanceAfterRefund = web3.eth.getBalance(investor);
    balanceBeforeInvestment.should.be.bignumber.equal(balanceAfterRefund);
  });

  it('should deny refunds before end', async function () {
    await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMRevert);
    await increaseTimeTo(this.openingTime);
    await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMRevert);
  });

  it('should deny refunds after end if goal was reached', async function () {
    await increaseTimeTo(this.openingTime);
    await this.crowdsale.sendTransaction({ value: GOAL, from: investor });
    await increaseTimeTo(this.afterClosingTime);
    await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMRevert);
  });

  it('should forward funds to wallet after end if goal was reached', async function () {
    await increaseTimeTo(this.openingTime);
    await this.crowdsale.sendTransaction({ value: GOAL, from: investor });
    await increaseTimeTo(this.afterClosingTime);
    const pre = web3.eth.getBalance(wallet);
    await this.crowdsale.finalize({ from: owner });
    const post = web3.eth.getBalance(wallet);
    post.minus(pre).should.be.bignumber.equal(GOAL);
  });

  /* @TODO
  it('should log purchase', async function () {
    const { logs } = await this.crowdsale.sendTransaction({ value: value, from: investor });
    const event = logs.find(e => e.event === 'TokenPurchase');
    should.exist(event);
    event.args.purchaser.should.equal(investor);
    event.args.beneficiary.should.equal(investor);
    event.args.value.should.be.bignumber.equal(value);
    event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
  });

  it('should assign tokens to sender', async function () {
    await this.crowdsale.sendTransaction({ value: value, from: investor });
    let balance = await this.token.balanceOf(investor);
    balance.should.be.bignumber.equal(expectedTokenAmount);
  });

  it('should forward funds to wallet', async function () {
    const pre = web3.eth.getBalance(wallet);
    await this.crowdsale.sendTransaction({ value, from: investor });
    const post = web3.eth.getBalance(wallet);
    post.minus(pre).should.be.bignumber.equal(value);
  });*/

  /*
  @TODO: grant tokens + ovecap
  */
  /* @FIXME
  it('should grant an extra 10% tokens as bonus for contributions over 5 ETH', async function () {
    const investmentAmount = ether(20);
    const largeInvestmentAmount = ether(100);
    const expectedTokenAmount = RATE.mul(investmentAmount);
    const expectedLargeTokenAmount = RATE.mul(largeInvestmentAmount).mul(1.1);
    await increaseTimeTo(this.openingTime);
    await this.crowdsale.buyTokens(investor, { value: investmentAmount, from: investor, gasPerice: 0 }).should.be.fulfilled;
    await this.crowdsale.buyTokens(otherInvestor, { value: largeInvestmentAmount, from: otherInvestor, gasPerice: 0 }).should.be.fulfilled;
    (await this.token.balanceOf(investor)).should.be.bignumber.equal(expectedTokenAmount);
    (await this.token.balanceOf(otherInvestor)).should.be.bignumber.equal(expectedLargeTokenAmount);
    (await this.token.totalSupply()).should.be.bignumber.equal(expectedTokenAmount.add(expectedLargeTokenAmount));
  });

  it('should mint 20% of total emitted tokens for the owner wallet upon finish', async function () {
    const totalInvestmentAmount = ether(20);
    await increaseTimeTo(this.openingTime);
    await this.crowdsale.buyTokens(investor, { value: totalInvestmentAmount, from: investor, gasPerice: 0 });
    await increaseTimeTo(this.afterClosingTime);
    const totalTokenAmount = await this.token.totalSupply();
    await this.crowdsale.finalize();
    (await this.token.balanceOf(wallet)).should.be.bignumber.equal(totalTokenAmount * 0.2);
  }); */

  /* @TODO
  it('should only allow whitelisted users to participate', async function () {
    const investmentAmount = ether(1);
    const expectedTokenAmount = RATE.mul(investmentAmount);

    // Requires implementing a whitelist(address) public function in the MyCrowdsale contract
    await this.crowdsale.whitelist(investor, { from: owner });
    await increaseTimeTo(this.startTime);

    await this.crowdsale.buyTokens(otherInvestor, { value: ether(1), from: otherInvestor }).should.be.rejectedWith(EVMRevert);
    await this.crowdsale.buyTokens(investor, { value: ether(1), from: investor }).should.be.fulfilled;

    const investorBalance = await this.token.balanceOf(investor);
    investorBalance.should.be.bignumber.equal(expectedTokenAmount);
  });

  it('should only allow the owner to whitelist an investor', async function () {
    // Check out the Ownable.sol contract to see if there is a modifier that could help here
    await this.crowdsale.whitelist(investor, { from: investor }).should.be.rejectedWith(EVMRevert);
  }); */
});
