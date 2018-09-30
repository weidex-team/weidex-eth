pragma solidity 0.4.24;

import "../token/IERC20.sol";

/**
 * @title Token contract
 * @dev extending ERC20 to support ExchangeOffering functionality.
 */
contract Token is IERC20 {
    function getBonusFactor(uint256 _startTime, uint256 _endTime, uint256 _weiAmount)
        public view returns (uint256);

    function isUserWhitelisted(address _user)
        public view returns (bool);
}
