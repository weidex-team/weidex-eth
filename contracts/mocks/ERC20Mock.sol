
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
}