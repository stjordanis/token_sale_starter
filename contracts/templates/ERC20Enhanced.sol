pragma solidity ^0.4.23;


contract ERC20Enhanced {

    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint)) internal allowed;
    uint public _totalSupply;

    function allowance(address owner, address spender) public view returns (uint256);
    function transferFrom(address from, address to, uint256 tokens) public returns (bool);
    function approve(address spender, uint256 tokens) public returns (bool);
    function balanceOf(address who) public view returns (uint256);
    function transfer(address to, uint256 tokens) public returns (bool);
    function totalSupply() public view returns (uint256);
    function migrate(address[] _recipients) public view returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

}
