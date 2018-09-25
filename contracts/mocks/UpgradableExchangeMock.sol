pragma solidity 0.4.24;

import "../exchange/Exchange.sol";
import "../exchange/IUpgradableExchange.sol";
import "./ExchangeMock.sol";
import "../utils/Token.sol";

contract UpgradableExchangeMock is ExchangeMock {

    uint8 public VERSION = 1;

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
    * @dev Used for test purposes only.
    * @param _version uint8 representing the new exchange version
    */
    function setMockExchangeVersion(uint8 _version)
        external
        onlyOwner
    {
        VERSION = _version;
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

    /**
    * @dev Helper function to migrate user's Ethers. Should be called only from the new exchange contract.
    * @param _user address representing the user address whos funds are being migrated.
    */
    function importEthers(address _user)
        external
        payable
    {
        require(
            false != isMigrationAllowed,
            "Fund migration is not allowed"
        );

        require(
            _user != address(0x0),
            "Invalid user. Address is not set yet."
        );

        require(
            msg.value > 0,
            "Exported ether amount should be greater than 0"
        );

        require(
            IUpgradableExchange(msg.sender).VERSION() < VERSION,
            "This function can only be called from the new exchange contract"
        );

        balances[ETH][_user] = balances[ETH][_user].add(msg.value);
    }

    /**
    * @dev Helper function to migrate user's Tokens. Should be called only from the new exchange contract.
    * @param _tokenAddress address representing the token address which is being migrated.
    * @param _tokenAmount uint256 representing the token amount being being migrated.
    * @param _user address representing the user address whos funds are being migrated.
    */
    function importTokens(
        address _tokenAddress,
        uint256 _tokenAmount,
        address _user
    )
        external
    {
        require(
            false != isMigrationAllowed,
            "Fund migration is not allowed"
        );

        require(
            _tokenAddress != ETH,
            "Ether exporting is handled in another function."
        );

        require(
            _user != ETH,
            "Invalid user."
        );

        require(
            _tokenAmount > 0,
            "Token amount should be greater than 0."
        );

        require(
            IUpgradableExchange(msg.sender).VERSION() < VERSION,
            "This function can only be called from the new exchange contract"
        );

        require(
            Token(_tokenAddress).transferFrom(msg.sender, this, _tokenAmount),
            "Transfer from failed."
        );

        balances[_tokenAddress][_user] = balances[_tokenAddress][_user].add(_tokenAmount);
    }

}
