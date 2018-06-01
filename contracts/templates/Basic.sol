pragma solidity ^0.4.23;

import "./SafeMath.sol";
import "./ERC20Enhanced.sol";


contract Basic is ERC20Enhanced {

    bool public transfersNotAllowed = true;

    modifier onlyTokenholder() {
        require(balances[msg.sender] > 0);
        _;
    }

    function balanceOf(address _tokenOwner) public view returns (uint balance) {
        return balances[_tokenOwner];
    }

    function allowance(address _tokenOwner, address _spender) public view returns (uint remaining) {
        return allowed[_tokenOwner][_spender];
    }

    function transfer(address _to, uint _tokens) public returns (bool success) {
        require(_to != address(0));
        require(transfersNotAllowed == false);
        require(_tokens <= balances[msg.sender] && _tokens > 0);

        balances[msg.sender] = SafeMath.sub(balances[msg.sender], _tokens);
        balances[_to] = SafeMath.add(balances[_to], _tokens);
        emit Transfer(msg.sender, _to, _tokens);
        return true;
    }

    function approve(address _spender, uint _tokens) public returns (bool success) {
        allowed[msg.sender][_spender] = _tokens;
        emit Approval(msg.sender, _spender, _tokens);
        return true;
    }

    function transferFrom(address _from, address _to, uint _tokens) public returns (bool success) {
        require(_to != address(0));
        require(_tokens <= balances[_from]);
        require(_tokens <= allowed[_from][msg.sender]);

        balances[_from] = SafeMath.sub(balances[_from], _tokens);
        allowed[_from][msg.sender] = SafeMath.sub(allowed[_from][msg.sender], _tokens);
        balances[_to] = SafeMath.add(balances[_to], _tokens);
        emit Transfer(_from, _to, _tokens);
        return true;
    }

    function totalSupply() public view returns (uint) {
        return _totalSupply - balances[address(0)];
    }

}
