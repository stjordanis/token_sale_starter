pragma solidity ^0.4.23;

import "../states/ICO.sol";
import "./Ownable.sol";


contract ForeignBuy is Ownable, ICOState {

    event Foreign(address _recipient, uint _tokens, string _txHash);

    function foreignBuy(address _recipient, uint _tokens, string _txHash) public botOnly {
        require(icoState == State.Running);
        require(_tokens > 0);
        // buy(_recipient, _tokens);
        emit Foreign(_recipient, _tokens, _txHash);
    }

}
