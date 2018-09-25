pragma solidity 0.4.24;

contract IUpgradableExchange {

    uint8 public VERSION;

    event FundsMigrated(address indexed user, address indexed exchangeAddress);
    
    function allowOrRestrictMigrations() external;

    function migrateFunds(address[] _tokens) external;

    function migrateEthers() private;

    function migrateTokens(address[] _tokens) private;

    function importEthers(address _user) external payable;

    function importTokens(address _tokenAddress, uint256 _tokenAmount, address _user) external;

}
