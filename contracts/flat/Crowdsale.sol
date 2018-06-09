pragma solidity ^0.4.23;

// File: contracts\states\ICO.sol

contract ICOState {

    enum State {
        Created,
        Running,
        Paused,
        Finished
    }

    State public icoState = State.Created;

}

// File: contracts\templates\ERC20Enhanced.sol

contract IERC20Enhanced {

    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) internal allowed;
    uint public _totalSupply;

    function allowance(address owner, address spender) public view returns (uint);
    function transferFrom(address from, address to, uint tokens) public returns (bool);
    function approve(address spender, uint tokens) public returns (bool);
    function balanceOf(address who) public view returns (uint);
    function transfer(address to, uint tokens) public returns (bool);
    function totalSupply() public view returns (uint);
    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);

}

// File: contracts\templates\SafeMath.sol

library SafeMath {

    function mul(uint a, uint b) internal pure returns (uint) {
        if (a == 0) {
            return 0;
        }
        uint c = a * b;
        require(c / a == b);
        return c;
    }

    function div(uint a, uint b) internal pure returns (uint) {
        require(b > 0);
        uint c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint a, uint b) internal pure returns (uint) {
        require(b <= a);
        return a - b;
    }

    function add(uint a, uint b) internal pure returns (uint) {
        uint c = a + b;
        require(c >= a);
        return c;
    }

}

// File: contracts\templates\Basic.sol

contract Basic is IERC20Enhanced {


    using SafeMath for uint;

    bool public transfersAllowed;

    function balanceOf(address _tokenOwner) public view returns (uint balance) {
        return balances[_tokenOwner];
    }

    function allowance(address _tokenOwner, address _spender) public view returns (uint remaining) {
        return allowed[_tokenOwner][_spender];
    }

    function transfer(address _to, uint _tokens) public returns (bool success) {
        require(_to != address(0));
        require(transfersAllowed == true);
        require(_tokens <= balances[msg.sender] && _tokens > 0);

        balances[msg.sender] = balances[msg.sender].sub(_tokens);
        balances[_to] = balances[_to].add(_tokens);
        emit Transfer(msg.sender, _to, _tokens);
        return true;
    }

    function approve(address _spender, uint _tokens) public returns (bool success) {
        allowed[msg.sender][_spender] = _tokens;
        emit Approval(msg.sender, _spender, _tokens);
        return true;
    }

    function transferFrom(address _from, address _to, uint _tokens) public returns (bool success) {
        require(transfersAllowed == true);
        require(_to != address(0));
        require(_tokens <= balances[_from]);
        require(_tokens <= allowed[_from][msg.sender]);

        balances[_from] = balances[_from].sub(_tokens);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_tokens);
        balances[_to] = balances[_to].add(_tokens);
        emit Transfer(_from, _to, _tokens);
        return true;
    }

    function totalSupply() public view returns (uint) {
        return _totalSupply;
    }

}

// File: contracts\templates\Ownable.sol

contract Ownable {

    address public owner;
    address public bot;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyBy(address _account) {
        require(msg.sender == _account);
        _;
    }

    modifier onlyOwnerOrUser(address _account) {
        require(msg.sender == _account || msg.sender == owner);
        _;
    }

    modifier botOnly() {
        require(msg.sender == bot);
        _;
    }

    function setBot(address _bot) external onlyOwner {
        bot = _bot;
    }

    function validate() public view returns (bool) {
        return (msg.sender == owner);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

}

// File: contracts\Crowdsale.sol

contract Crowdsale is Basic, Ownable, ICOState {

    using SafeMath for uint;

    struct TxHash {
        uint index;
    }

    bytes32 public symbol;
    bytes32 public  tokenName;
    uint8 public decimals;
    uint public rate;
    uint public weiRaised;
    bool private reentrancyLock = false;
    bool public shouldWhitelist;
    mapping(address => bool) internal whitelist;
    event RunIco();
    event PauseIco();
    event FinishIco();
    event Foreign(address _recipient, uint _tokens, bytes32 _txHash);
    uint private max = 2**256-1;
    mapping (bytes32 => TxHash) public hashes;
    bytes32[] public hashIndex;

    modifier isWhitelisted(address _beneficiary) {
        if (shouldWhitelist) {
            require(whitelist[_beneficiary]);
        }
        _;
    }

    constructor() public {
        shouldWhitelist = false;
        symbol = "TOK";
        tokenName = "TestToken";
        rate = 3;
        decimals = 18;
        transfersAllowed = false;
    }

    function setParams(bytes32 _symbol, bytes32 _name, uint8 _decimals, uint _rate) public onlyOwner {
        require(_rate > 0 && _rate <= max.div(_rate));
        require(_decimals > 0 && _decimals <= 18);
        symbol = _symbol;
        tokenName = _name;
        decimals = _decimals;
        rate = _rate;
    }

    function setRate(uint _rate) public onlyOwner {
        require(_rate > 0 && _rate <= max.div(_rate));
        rate = _rate;
    }

    function setWhitelisting() public onlyOwner {
        require(shouldWhitelist == false);
        shouldWhitelist = true;
    }

    function unsetWhitelisting() public onlyOwner {
        require(shouldWhitelist == true);
        shouldWhitelist = false;
    }

    function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
        allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(_addedValue);
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool) {
        uint oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    function _buy(address _beneficiary, uint tokens) internal {
        require(_totalSupply.add(tokens) <= max);
        balances[_beneficiary] = balances[_beneficiary].add(tokens);
        _totalSupply = _totalSupply.add(tokens);
        emit Transfer(address(0), _beneficiary, tokens);
    }

    function () public payable isWhitelisted(msg.sender) {
        require(!reentrancyLock);
        reentrancyLock = true;
        require(icoState == State.Running);
        uint _weiAmount = msg.value;
        address _beneficiary = msg.sender;
        require(_beneficiary != address(0) && _beneficiary != owner);
        require(_weiAmount != 0);
        require(_weiAmount.mul(rate) <= max);
        uint tokens = _weiAmount.mul(rate);
        _buy(_beneficiary, tokens);
        owner.transfer(_weiAmount);
        require(weiRaised.add(_weiAmount) <= max);
        weiRaised = weiRaised.add(_weiAmount);
        reentrancyLock = false;
    }

    function _safeTransfer(address _to, uint _tokens) internal {
        assert(transfer(_to, _tokens));
    }

    function reclaimToken(address _tokenOwner) public onlyOwner returns (bool) {
        uint balance = balanceOf(_tokenOwner);
        require(balance > 0);
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
        require(transfersAllowed == false);
        transfersAllowed = true;
    }

    function disableTransfers() public onlyOwner {
        require(transfersAllowed == true);
        transfersAllowed = false;
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
        transfersAllowed = true;
        icoState = State.Finished;
        emit FinishIco();
    }

    function hashExists(bytes32 _hash) public view returns(bool) {
        if (hashIndex.length == 0) {
            return false;
        }
        return (hashIndex[hashes[_hash].index] == _hash);
    }

    function foreignBuy(address _recipient, uint _tokens, bytes32 _txHash) public botOnly isWhitelisted(_recipient) {
        require(hashExists(_txHash) == false);
        require(_recipient != owner && _recipient != bot);
        require(icoState == State.Running);
        require(_tokens > 0 && _tokens <= max);
        _buy(_recipient, _tokens);
        hashIndex.push(_txHash);
        hashes[_txHash].index = hashIndex.length - 1;
        emit Foreign(_recipient, _tokens, _txHash);
    }

}
