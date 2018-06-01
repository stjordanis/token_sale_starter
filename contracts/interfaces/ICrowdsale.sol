pragma solidity ^0.4.23;


contract ICrowdsale {
    function balanceOf(address _owner) public view returns (uint);
    function burnTokens(address _owner) public;
}
