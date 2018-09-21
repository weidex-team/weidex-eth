pragma solidity 0.4.24;

/**
* @title ERC-20 Token Interface.
* @dev Use this interface in order to call certain ERC-20 token functions.
*/
contract Token {

    mapping (address => uint256) public balanceOf;

    mapping (address => mapping (address => uint256)) public allowance;

    function transfer(address _to, uint256 _value) external returns (bool);

    function approve(address _spender, uint256 _value) external returns (bool);

    function transferFrom(address _from, address _to, uint256 _value) external returns (bool);

    function getBonusFactor(uint256 _startTime, uint256 _endTime, uint256 _weiAmount) public view returns (uint256);

    function isUserWhitelisted(address _user) public view returns (bool);

}
