pragma solidity 0.4.24;

// The old ERC20 token standard defines transfer and transferFrom without return value.
// So the current ERC20 token standard is incompatible with this one.
interface IOldERC20 {
	function transfer(address to, uint256 value)
        external;

	function transferFrom(address from, address to, uint256 value)
        external;

	function approve(address spender, uint256 value)
        external;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}
