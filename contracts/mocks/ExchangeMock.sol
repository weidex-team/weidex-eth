pragma solidity 0.4.24;

import "../utils/Ownable.sol";
import "../utils/Math.sol";
import "../utils/Token.sol";

contract ExchangeMock is Ownable {

    using Math for uint256;

    uint8 constant public VERSION = 1;

    mapping(address => mapping(address => uint256)) public balances;

    address constant public ETH = address(0x0);

    event Deposit(
        address indexed tokenAddress,
        address indexed user,
        uint256 amount,
        uint256 balance
    );

    event Withdraw(
        address indexed tokenAddress,
        address indexed user,
        uint256 amount,
        uint256 balance
    );

    /**
    * @dev Allows user to deposit Ethers in the exchange contract.
    * Only the respected user can withdraw these Ethers.
    */
    function depositEthers() external payable
    {
        _depositEthers();
        emit Deposit(ETH, msg.sender, msg.value, balances[ETH][msg.sender]);
    }

    /**
    * @dev Allows user to deposit Tokens in the exchange contract.
    * Only the respected user can withdraw these tokens.
    * @param _tokenAddress address representing the token contract address.
    * @param _amount uint256 representing the token amount to be deposited.
    */
    function depositTokens(
        address _tokenAddress,
        uint256 _amount
    )
        external
    {
        _depositTokens(_tokenAddress, _amount);
        emit Deposit(_tokenAddress, msg.sender, _amount, balances[_tokenAddress][msg.sender]);
    }

    /**
    * @dev Internal version of deposit Ethers.
    */
    function _depositEthers() internal
    {
        balances[ETH][msg.sender] = balances[ETH][msg.sender].add(msg.value);
    }

    /**
    * @dev Internal version of deposit Tokens.
    */
    function _depositTokens(
        address _tokenAddress,
        uint256 _amount
    )
    internal
    {
        balances[_tokenAddress][msg.sender] = balances[_tokenAddress][msg.sender].add(_amount);

        require(
            Token(_tokenAddress).transferFrom(msg.sender, this, _amount),
            "Token transfer is not successfull (maybe you haven't used approve first?)"
        );
    }
    
}
