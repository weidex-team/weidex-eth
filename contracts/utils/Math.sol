pragma solidity 0.4.24;

/**
 * @title Math
 * @dev Math operations with safety checks that throw on error
 */
library Math {

    /**
     * @dev Multiplies two numbers, throws on overflow.
     */
    function mul(uint256 a, uint256 b)
        internal
        pure
        returns(uint256 c)
    {
        if (a == 0) {
            return 0;
        }
        c = a * b;
        assert(c / a == b);
        return c;
    }

    /**
     * @dev Integer division of two numbers, truncating the quotient.
     */
    function div(uint256 a, uint256 b)
        internal
        pure
        returns(uint256)
    {
        return a / b;
    }

    /**
     * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
     */
    function sub(uint256 a, uint256 b)
        internal
        pure
        returns(uint256)
    {
        assert(b <= a);
        return a - b;
    }

    /**
     * @dev Adds two numbers, throws on overflow.
     */
    function add(uint256 a, uint256 b)
        internal
        pure
        returns(uint256 c)
    {
        c = a + b;
        assert(c >= a);
        return c;
    }

    /**
    * @dev Calculate the ration between two assets. For example ETH/WDX
    * @param _numerator uint256 base currency
    * @param _denominator uint256 quote currency
    */
    function calculateRate(
        uint256 _numerator,
        uint256 _denominator
    )
        internal
        pure
        returns(uint256)
    {
        return div(mul(_numerator, 1e18), _denominator);
    }

    /**
    * @dev Calculate the fee in WDX
    * @param _fee uint256 full fee
    * @param _referralFeeRate uint256 referral fee rate
    */
    function calculateReferralFee(uint256 _fee, uint256 _referralFeeRate) internal pure returns (uint256) {
        return div(_fee, _referralFeeRate);
    }

    /**
    * @dev Calculate the fee in WDX
    * @param _etherAmount uint256 amount in Ethers
    * @param _tokenRatio uint256 the rate between ETH/WDX
    * @param _feeRate uint256 the fee rate
    */
    function calculateWdxFee(uint256 _etherAmount, uint256 _tokenRatio, uint256 _feeRate) internal pure returns (uint256) {
        return div(div(mul(_etherAmount, 1e18), _tokenRatio), mul(_feeRate, 2));
    }

}
