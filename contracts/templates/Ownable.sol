pragma solidity ^0.4.23;


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
