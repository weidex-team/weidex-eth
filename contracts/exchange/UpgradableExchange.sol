pragma solidity 0.4.24;

import "./Exchange.sol";
import "./IUpgradableExchange.sol";
import "../utils/Token.sol";

contract UpgradableExchange is Exchange {

    uint8 constant public VERSION = 0;

    address public newExchangeAddress;

    bool public isMigrationAllowed;

    event FundsMigrated(address indexed user, address indexed exchangeAddress);

    /**
    * @dev Owner can set the address of the new version of the exchange contract.
    * @param _newExchangeAddress address representing the new exchange contract address
    */
    function setNewExchangeAddress(address _newExchangeAddress)
        external
        onlyOwner
    {
        newExchangeAddress = _newExchangeAddress;
    }

    /**
    * @dev Enables/Disables the migrations. Can be called only by the owner.
    */
    function allowOrRestrictMigrations()
        external
        onlyOwner
    {
        isMigrationAllowed = !isMigrationAllowed;
    }

    /**
    * @dev Set the address of the new version of the exchange contract. Should be called by the user.
    * @param _tokens address[] representing the token addresses which are going to be migrated.
    */
    function migrateFunds(address[] _tokens) external {

        require(
            false != isMigrationAllowed,
            "Fund migration is not allowed"
        );

        require(
            IUpgradableExchange(newExchangeAddress).VERSION() > VERSION,
            "New exchange version should be greater than the current version."
        );

        migrateEthers();

        migrateTokens(_tokens);

        emit FundsMigrated(msg.sender, newExchangeAddress);
    }

    /**
    * @dev Helper function to migrate user's Ethers. Should be called in migrateFunds() function.
    */
    function migrateEthers() private {

        uint256 etherAmount = balances[ETH][msg.sender];
        if (etherAmount > 0) {
            balances[ETH][msg.sender] = 0;

            IUpgradableExchange(newExchangeAddress).importEthers.value(etherAmount)(msg.sender);
        }
    }

    /**
    * @dev Helper function to migrate user's tokens. Should be called in migrateFunds() function.
    * @param _tokens address[] representing the token addresses which are going to be migrated.
    */
    function migrateTokens(address[] _tokens) private {

        for (uint256 index = 0; index < _tokens.length; index++) {

            address tokenAddress = _tokens[index];

            uint256 tokenAmount = balances[tokenAddress][msg.sender];

            if (0 == tokenAmount) {
                continue;
            }

            require(
                Token(tokenAddress).approve(newExchangeAddress, tokenAmount),
                "Approve failed"
            );

            balances[tokenAddress][msg.sender] = 0;

            IUpgradableExchange(newExchangeAddress).importTokens(tokenAddress, tokenAmount, msg.sender);
        }
    }
    
}
