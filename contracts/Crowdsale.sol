pragma solidity ^0.4.23;

import "./templates/Ownable.sol";
import "./templates/Basic.sol";
import "./templates/SafeMath.sol";
import "./states/ICO.sol";

contract Crowdsale is Basic, Ownable, ICOState {

    using SafeMath for uint;

    bytes32 public symbol;
    bytes32 public  tokenName;
    uint8 public decimals;
    uint public rate;
    uint public weiRaised;
    bool private reentrancyLock = false;
    bool public shouldWhitelist = false;
    mapping(address => bool) internal whitelist;
    event RunIco();
    event PauseIco();
    event FinishIco();
    event Foreign(address _recipient, uint _tokens, string _txHash);

    modifier isWhitelisted(address _beneficiary) {
        if (shouldWhitelist) {
            require(whitelist[_beneficiary]);
        }
        _;
    }

    function setParams(bytes32 _symbol, bytes32 _name, uint8 _decimals, uint _rate) public onlyOwner {
        symbol = _symbol;
        tokenName = _name;
        decimals = _decimals;
        rate = _rate;
    }

    function setRate(uint _rate) public onlyOwner {
        rate = _rate;
    }

    function setWhitelisting() public onlyOwner {
        shouldWhitelist = true;
    }

    function unsetWhitelisting() public onlyOwner {
        shouldWhitelist = false;
    }

    function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
        allowed[msg.sender][_spender] = SafeMath.add(allowed[msg.sender][_spender], _addedValue);
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool) {
        uint oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = SafeMath.sub(oldValue, _subtractedValue);
        }
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    function _buy(address _beneficiary, uint tokens) internal {
        balances[_beneficiary] = balances[_beneficiary].add(tokens);
        _totalSupply = _totalSupply.add(tokens);
        emit Transfer(address(0), _beneficiary, tokens);
    }

    function () public payable isWhitelisted(msg.sender) {
        require(icoState == State.Running);
        uint _weiAmount = msg.value;
        address _beneficiary = msg.sender;
        require(_beneficiary != address(0));
        require(_weiAmount != 0);
        uint tokens = _weiAmount.mul(rate);
        require(!reentrancyLock);
        reentrancyLock = true;
        _buy(_beneficiary, tokens);
        owner.transfer(_weiAmount);
        weiRaised = weiRaised.add(_weiAmount);
        reentrancyLock = false;
    }

    function _safeTransfer(address _to, uint _tokens) internal {
        assert(transfer(_to, _tokens));
    }

    function reclaimToken(address _tokenOwner) public onlyOwner returns (bool) {
        uint balance = balanceOf(_tokenOwner);
        _safeTransfer(_tokenOwner, balance);
        return true;
    }

    function addToWhitelist(address _beneficiary) public onlyOwner {
        whitelist[_beneficiary] = true;
    }

    function addManyToWhitelist(address[] _beneficiaries) public onlyOwner {
        for (uint i = 0; i < _beneficiaries.length; i++) {
            whitelist[_beneficiaries[i]] = true;
        }
    }

    function removeFromWhitelist(address _beneficiary) public onlyOwner {
        whitelist[_beneficiary] = false;
    }

    function getWhitelistStatus(address _beneficiary) public view onlyOwner returns (bool) {
        return whitelist[_beneficiary];
    }

    function burnTokens(address _recipient) public onlyOwner {
        balances[_recipient] = 0;
    }

    function withdraw() public onlyOwner {
        owner.transfer(address(this).balance);
    }

    function allowTransfers() public onlyOwner {
        transfersNotAllowed = false;
    }

    function startIco() public onlyOwner {
        require(icoState == State.Created || icoState == State.Paused);
        icoState = State.Running;
        emit RunIco();
    }

    function pauseIco() public onlyOwner {
        require(icoState == State.Running);
        icoState = State.Paused;
        emit PauseIco();
    }

    function finishIco() public onlyOwner {
        require(icoState == State.Running || icoState == State.Paused);
        transfersNotAllowed = false;
        icoState = State.Finished;
        emit FinishIco();
    }

    function foreignBuy(address _recipient, uint _tokens, string _txHash) public botOnly isWhitelisted(_recipient) {
        require(icoState == State.Running);
        require(_tokens > 0);
        _buy(_recipient, _tokens);
        emit Foreign(_recipient, _tokens, _txHash);
    }

}
