import assertRevert from './helpers/assertRevert'
import expectThrow from './helpers/expectThrow'
import toPromise from './helpers/toPromise'
const PowerPiperToken = artifacts.require('./PowerPiperToken.sol')
const HasNoContracts = artifacts.require('./zeppelin/HasNoContracts.sol')
const ForceEther = artifacts.require('./zeppelin/ForceEther.sol')

contract('PowerPiperToken', function ([owner, recipient, anotherAccount]) {
  const _name = 'PowerPiperToken'
  const _symbol = 'PWP'
  const _decimals = 3
  const _creator = owner
  const _zero = '0x0000000000000000000000000000000000000000'
  const _amount = web3.toWei('1', 'ether')
  const INITIAL_TOKENS = 670000000000000;

  beforeEach('setup token contract for each test', async function () {
    this.token = await PowerPiperToken.new(INITIAL_TOKENS, { from: _creator })
    this.supply = await this.token.totalSupply()
  })

  describe('initial conditions', function () {
    it(`has initial supply of ${INITIAL_TOKENS} tokens`, async function () {
      assert(this.supply.eq(INITIAL_TOKENS))
    })

    it('should have 0 tokens in the first account', function () {
      return PowerPiperToken.deployed().then(function (instance) {
        return instance.balanceOf.call(_creator)
      }).then(function (balance) {
        assert.equal(balance.valueOf(), 0, `0 wasn't in the first account`)
      })
    })
  })

  describe('when mintable', function () {
    const initial = 10000

    beforeEach(async function () {
      await this.token.mint(owner, initial, { from: owner })
    })

    it('should return false if still mintable', async function () {
      const mintingFinished = await this.token.mintingFinished()
      assert.equal(mintingFinished, false)
    })

    it('returns zero for some account', async function () {
      const balance = await this.token.balanceOf(anotherAccount)
      assert.equal(balance, 0)
    })

    it('finishes token minting', async function () {
      await this.token.finishMinting({ from: owner })

      const mintingFinished = await this.token.mintingFinished()
      assert.equal(mintingFinished, true)
    })

    it('emits a mint finished event', async function () {
      const { logs } = await this.token.finishMinting({ from: owner })

      assert.equal(logs.length, 1)
      assert.equal(logs[0].event, 'MintFinished')
    })

    it('reverts if trying to stop minting from another account', async function () {
      await assertRevert(this.token.finishMinting({ from: anotherAccount }))
    })

    it('mints the requested amount', async function () {
      const amount = 333
      await this.token.mint(owner, amount, { from: owner })
      const balance = await this.token.balanceOf(owner)
      assert.equal(balance, (amount + initial))
    })

    it('emits a mint finished event', async function () {
      const amount = 300
      const { logs } = await this.token.mint(owner, amount, { from: owner })

      assert.equal(logs.length, 2)
      assert.equal(logs[0].event, 'Mint')
      assert.equal(logs[0].args.to, owner)
      assert.equal(logs[0].args.amount, amount)
      assert.equal(logs[1].event, 'Transfer')
    })

    it('reverts if mints from another account', async function () {
      const amount = 3
      await assertRevert(this.token.mint(owner, amount, { from: anotherAccount }))
    })

    describe('has no contracts', function () {
      beforeEach(async () => {
        // Create contract and token
        hasNoContracts = await HasNoContracts.new()

        // Force ownership into contract
        await this.token.transferOwnership(hasNoContracts.address)
        const owner = await this.token.owner()
        assert.equal(owner, hasNoContracts.address)
      })
    })

    describe('transfers', function () {
      it('transfers the requested amount from owner to recipient', async function () {
        const amount = 111
        await this.token.transfer(recipient, amount, { from: owner })

        const senderBalance = await this.token.balanceOf(owner)
        assert.equal(senderBalance, (initial - amount))

        const recipientBalance = await this.token.balanceOf(recipient)
        assert.equal(recipientBalance, amount)
      })

      it('transfers the requested amount from recipient to owner', async function () {
        const amount = 300

        await this.token.transfer(recipient, amount, { from: owner })
        await this.token.transfer(owner, amount, { from: recipient })

        const senderBalance = await this.token.balanceOf(recipient)
        assert.equal(senderBalance, 0)

        const recipientBalance = await this.token.balanceOf(owner)
        assert.equal(recipientBalance, initial)
      })

      it('should revert transfer if owner has no tokens', async function () {
        await assertRevert(this.token.transfer(recipient, (initial + 1), { from: owner }))
      })

      it('should revert transfer if recipient has no tokens', async function () {
        await assertRevert(this.token.transfer(owner, 1, { from: recipient }))
      })

      it('emits a transfer event', async function () {
        const amount = 1
        const { logs } = await this.token.transfer(recipient, amount, { from: owner })

        assert.equal(logs.length, 1)
        assert.equal(logs[0].event, 'Transfer')
        assert.equal(logs[0].args.from, owner)
        assert.equal(logs[0].args.to, recipient)
        assert(logs[0].args.value.eq(amount))
      })

      it('reverts transfer if recipient is zero', async function () {
        await assertRevert(this.token.transfer(_zero, 100, { from: owner }))
      })
    })
  })

  describe('when the token is finished mint', function () {
    beforeEach(async function () {
      await this.token.finishMinting({ from: owner })
    })

    it('returns true', async function () {
      const mintingFinished = await this.token.mintingFinished.call()
      assert.equal(mintingFinished, true)
    })

    it('reverts if owner tries mint', async function () {
      await assertRevert(this.token.finishMinting({ from: owner }))
    })

    it('reverts if another account tries mint', async function () {
      await assertRevert(this.token.finishMinting({ from: anotherAccount }))
    })

    it('reverts for amount from owner', async function () {
      await assertRevert(this.token.mint(owner, 100, { from: owner }))
    })

    it('reverts from amount from another account', async function () {
      await assertRevert(this.token.mint(owner, 500, { from: anotherAccount }))
    })
  })

  it('should have an owner', async function () {
    let owner = await this.token.owner()
    assert.isTrue(owner !== 0)
  })

  it('changes owner after transfer', async function () {
    let other = anotherAccount
    await this.token.transferOwnership(other)
    let owner = await this.token.owner()

    assert.isTrue(owner === other)
  })

  it('should prevent non-owners from transfering', async function () {
    const other = anotherAccount
    const owner = await this.token.owner.call()
    assert.isTrue(owner !== other)
    await assertRevert(this.token.transferOwnership(other, { from: other }))
  })

  it('should guard ownership against stuck state', async function () {
    let originalOwner = await this.token.owner()
    await assertRevert(this.token.transferOwnership(null, { from: originalOwner }))
  })

  it('should be constructorable', async function () {
    await PowerPiperToken.new(INITIAL_TOKENS)
  })

  /* enbale if constructor is payable
  it('should not accept ether in constructor', async function () {
    await expectThrow(PowerPiperToken.new(INITIAL_TOKENS, { value: _amount }))
  })*/

  it('should not accept ether', async function () {
    let hasNoEther = await PowerPiperToken.new(INITIAL_TOKENS)

    await expectThrow(
      toPromise(web3.eth.sendTransaction)({
        from: anotherAccount,
        to: hasNoEther.address,
        value: _amount
      })
    )
  })

  it('should allow owner to reclaim ether', async function () {
    let hasNoEther = await PowerPiperToken.new(INITIAL_TOKENS)
    const startBalance = await web3.eth.getBalance(hasNoEther.address)
    assert.equal(startBalance, 0)

    let forceEther = await ForceEther.new({ value: _amount })
    await forceEther.destroyAndSend(hasNoEther.address)
    const forcedBalance = await web3.eth.getBalance(hasNoEther.address)
    assert.equal(forcedBalance, _amount)

    const ownerStartBalance = await web3.eth.getBalance(owner)
    await hasNoEther.reclaimEther()
    const ownerFinalBalance = await web3.eth.getBalance(owner)
    const finalBalance = await web3.eth.getBalance(hasNoEther.address)
    assert.equal(finalBalance, 0)
    assert.isAbove(ownerFinalBalance, ownerStartBalance)
  })

  it('should allow only owner to reclaim ether', async function () {
    let hasNoEther = await PowerPiperToken.new(INITIAL_TOKENS, { from: owner })

    let forceEther = await ForceEther.new({ value: _amount })
    await forceEther.destroyAndSend(hasNoEther.address)
    const forcedBalance = await web3.eth.getBalance(hasNoEther.address)
    assert.equal(forcedBalance, _amount)

    await expectThrow(hasNoEther.reclaimEther({ from: anotherAccount }))
  })

  /*
  it('should recover balance', async function() {
    const result = await this.token.recoverBalance(anotherAccount, { from: owner, value: web3.toWei('1', 'ether') })
    assert(result.receipt)
    assert(result.logs)
    assert.equal(result.logs.length, 1)

    let receipt = result.receipt
    let log = result.logs[0]
    assert.equal(receipt.status, 1)
    assert.equal(log.event, 'RecoverBalance')
    assert.equal(log.args._owner, anotherAccount)
    assert.equal(log.args._receiver, owner)
    assert.equal(log.args._state, true)
  })*/

})
