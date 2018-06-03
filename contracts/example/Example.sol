pragma solidity ^0.4.23;

import "../interfaces/ICrowdsale.sol";
import "../templates/Ownable.sol";


contract Example is Ownable {
    ICrowdsale crowdsale;

    function setTokenSaleStarterAddress(address _addr) public onlyOwner {
        crowdsale = ICrowdsale(_addr);
    }

    function _migrate(address _recipient) internal {
        uint _balance = crowdsale.balanceOf(_recipient);
        require(_balance > 0);
        crowdsale.burnTokens(_recipient);
    }

    function migrate(address[] _recipients) public onlyOwner returns (bool) {
        for(uint i = 0; i < _recipients.length; i++) {
            _migrate(_recipients[i]);
        }
        return true;
    }

}