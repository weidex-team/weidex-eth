pragma solidity 0.4.24;

import "./Exchange.sol";
import "../utils/Math.sol";
import "./DailyVolumeUpdater.sol";

contract DiscountTokenExchange is Exchange, DailyVolumeUpdater {

    uint256 internal discountTokenRatio;

    uint256 private minimumTokenAmountForUpdate;

    address public discountTokenAddress;

    bool internal initialized = false;

    constructor(
        address _discountTokenAddress,
        uint256 _discountTokenRatio
    )
        public
    {
        discountTokenAddress = _discountTokenAddress;
        discountTokenRatio = _discountTokenRatio;
    }

    modifier onlyOnce() {
        require(
            initialized == false,
            "Exchange is already initialized"
        );
        _;
    }

    /**
    * @dev Update the token discount contract.
    * @param _discountTokenAddress address of the token used for fee discount
    * @param _discountTokenRatio uint256 initial rate of the token discount contract
    */
    function setDiscountToken(
        address _discountTokenAddress,
        uint256 _discountTokenRatio,
        uint256 _minimumTokenAmountForUpdate
    )
        public
        onlyOwner
        onlyOnce
    {
        discountTokenAddress = _discountTokenAddress;
        discountTokenRatio = _discountTokenRatio;
        minimumTokenAmountForUpdate = _minimumTokenAmountForUpdate;
        initialized = true;
    }

    /**
    * @dev Update the token ratio.
    * Add a minimum requirement for the amount of tokens being traded
    * to avoid possible intentional manipulation
    * @param _etherAmount uint256 amount in Ethers (wei)
    * @param _tokenAmount uint256 amount in Tokens
    */
    function updateTokenRatio(
        uint256 _etherAmount,
        uint256 _tokenAmount
    )
        internal
    {
        if(_tokenAmount >= minimumTokenAmountForUpdate) {
            discountTokenRatio = _etherAmount.calculateRate(_tokenAmount);
        }
    }

    /**
    * @dev Set the minimum requirement for updating the price.
    * This should be called whenever the rate of the token
    * has changed massively.
    * In order to avoid token price manipulation (that will reduce the fee)
    * The minimum amount requirement take place.
    * For example: Someone buys or sells 0.0000000001 Tokens with
    * high rate against ETH and after that execute a trade,
    * reducing his fees to approximately zero.
    * Having the mimimum amount requirement for updating
    * the price will protect us from such cases because
    * it will not be worth to do it.
    * @param _minimumTokenAmountForUpdate - the new mimimum amount of
    * tokens for updating the ratio (price)
    */
    function setMinimumTokenAmountForUpdate(
        uint256 _minimumTokenAmountForUpdate
    )
        external
        onlyOwner
    {
        minimumTokenAmountForUpdate = _minimumTokenAmountForUpdate;
    }

    /**
    * @dev Execute WeiDexToken Sale Order based on the order input parameters
    * and the signature from the maker's signing.
    * @param _orderAddresses address[3] representing
    * [0] address of the order maker
    * [1] address of WeiDexToken
    * [2] address of Ether (0x0)
    * @param _orderValues uint256[4] representing
    * [0] amount in WDX
    * [1] amount in Ethers (wei)
    * [2] order nonce used for hash uniqueness
    * @param _takerSellAmount uint256 - amount being asked from the taker, should be in ethers
    * @param _v uint8 parameter parsed from the signature recovery
    * @param _r bytes32 parameter parsed from the signature (from 0 to 32 bytes)
    * @param _s bytes32 parameter parsed from the signature (from 32 to 64 bytes)
    */
    function takeSellTokenOrder(
        address[3] _orderAddresses,
        uint256[3] _orderValues,
        uint256 _takerSellAmount,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    )
        external
    {
        require(
            _orderAddresses[1] == discountTokenAddress,
            "Should sell WeiDex Tokens"
        );

        require(
            0 < takeOrder(OrderLib.createOrder(_orderAddresses, _orderValues), _takerSellAmount, _v, _r, _s),
            "Trade failure"
        );
        updateVolume(_takerSellAmount);
        updateTokenRatio(_orderValues[1], _orderValues[0]);
    }

    /**
    * @dev Execute WeiDexToken Buy Order based on the order input parameters
    * and the signature from the maker's signing.
    * @param _orderAddresses address[3] representing
    * [0] address of the order maker
    * [1] address of Ether (0x0)
    * [2] address of WeiDexToken
    * @param _orderValues uint256[4] representing
    * [0] amount in Ethers
    * [1] amount in WDX
    * [2] order nonce used for hash uniqueness
    * @param _takerSellAmount uint256 - amount being asked from the taker
    * @param _v uint8 parameter parsed from the signature recovery
    * @param _r bytes32 parameter parsed from the signature (from 0 to 32 bytes)
    * @param _s bytes32 parameter parsed from the signature (from 32 to 64 bytes)
    */
    function takeBuyTokenOrder(
        address[3] _orderAddresses,
        uint256[3] _orderValues,
        uint256 _takerSellAmount,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    )
        external
    {
        require(
            _orderAddresses[2] == discountTokenAddress,
            "Should buy WeiDex Tokens"
        );

        uint256 receivedAmount = takeOrder(OrderLib.createOrder(_orderAddresses, _orderValues), _takerSellAmount, _v, _r, _s);
        require(0 < receivedAmount, "Trade failure");
        updateVolume(receivedAmount);
        updateTokenRatio(_orderValues[0], _orderValues[1]);
    }

}
