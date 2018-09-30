pragma solidity 0.4.24;

import "./Exchange.sol";
import "./ReferralExchange.sol";
import "../utils/SafeToken.sol";

contract OldERC20ExchangeSupport is Exchange, ReferralExchange {

    /**
    * @dev Allows user to deposit Tokens in the exchange contract.
    * Only the respected user can withdraw these tokens.
    * @param _tokenAddress address representing the token contract address.
    * @param _amount uint256 representing the token amount to be deposited.
    */
    function depositOldTokens(
        address _tokenAddress,
        uint256 _amount
    )
        external
    {
        address user = msg.sender;
        _depositOldTokens(_tokenAddress, _amount, user);
        emit Deposit(_tokenAddress, user, _amount, balances[_tokenAddress][user]);
    }

    /**
    * @dev Deposit Tokens with a given referrer address
    * @param _referrer address of the referrer
    */
    function depositOldTokens(
        address _tokenAddress,
        uint256 _amount,
        address _referrer
    )
        external
    {
        address user = msg.sender;

        require(
            0x0 == referrals[user],
            "This user already have a referrer."
        );

        _depositOldTokens(_tokenAddress, _amount, user);
        referrals[user] = _referrer;
        emit ReferralDeposit(_tokenAddress, user, _referrer, _amount, balances[_tokenAddress][user]);
    }

        /**
    * @dev Allows user to deposit Tokens for beneficiary in the exchange contract.
    * Only the beneficiary can withdraw these tokens.
    * @param _tokenAddress address representing the token contract address.
    * @param _amount uint256 representing the token amount to be deposited.
    * @param _beneficiary address representing the token amount to be deposited.
    */
    function depositOldTokensFor(
        address _tokenAddress,
        uint256 _amount,
        address _beneficiary
    )
        external
    {
        _depositOldTokens(_tokenAddress, _amount, _beneficiary);
        emit Deposit(_tokenAddress, _beneficiary, _amount, balances[_tokenAddress][_beneficiary]);
    }

    /**
    * @dev Allows user to withdraw specific Token from the exchange contract.
    * Throws if the user balance is lower than the requested amount.
    * @param _tokenAddress address representing the token contract address.
    * @param _amount uint256 representing the amount to be withdrawn.
    */
    function withdrawOldTokens(
        address _tokenAddress,
        uint256 _amount
    )
        external
    {
        require(
            balances[_tokenAddress][msg.sender] >= _amount,
            "Not enough funds to withdraw."
        );

        balances[_tokenAddress][msg.sender] = balances[_tokenAddress][msg.sender].sub(_amount);

        SafeOldERC20.transfer(_tokenAddress, msg.sender, _amount);

        emit Withdraw(_tokenAddress, msg.sender, _amount, balances[_tokenAddress][msg.sender]);
    }

    /**
    * @dev Internal version of deposit Tokens.
    */
    function _depositOldTokens(
        address _tokenAddress,
        uint256 _amount,
        address _beneficiary
    )
        internal
    {
        balances[_tokenAddress][_beneficiary] = balances[_tokenAddress][_beneficiary].add(_amount);

        SafeOldERC20.transferFrom(_tokenAddress, msg.sender, this, _amount);
    }
}
