
pragma solidity ^0.4.24;

import "../token/ERC20.sol";
import "../token/ERC20Detailed.sol";

contract ERC20Mock is ERC20, ERC20Detailed {
    constructor(
        string name,
        string symbol,
        uint8 decimals
    )
        ERC20Detailed(name, symbol, decimals)
        public
    { }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function getBonusFactor(
        uint256 /*_startTime*/,
        uint256 /*_endTime*/,
        uint256 /*_weiAmount*/
    )
        public
        pure
        returns (uint256)
    {
        return 0;
    }

    function isUserWhitelisted(address /*_user*/) public pure returns (bool) {
        return true;
    }
}