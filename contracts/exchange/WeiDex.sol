pragma solidity 0.4.24;

import "../utils/Math.sol";
import "../utils/OrderLib.sol";
import "../utils/Token.sol";

import "./DiscountTokenExchange.sol";
import "./ReferralExchange.sol";
import "./UpgradableExchange.sol";
import "./ExchangeOffering.sol";
import "./OldERC20ExchangeSupport.sol";

contract WeiDex is DiscountTokenExchange, ReferralExchange, UpgradableExchange, ExchangeOffering, OldERC20ExchangeSupport  {

    mapping(bytes4 => bool) private allowedMethods;

    function () public payable {
        revert("Cannot send Ethers to the contract, use depositEthers");
    }

    constructor(
        address _feeAccount,
        uint256 _feeRate,
        uint256 _referralFeeRate
    )
        public
        Exchange(_feeAccount, _feeRate)
        ReferralExchange(_referralFeeRate)
    {
        // empty constructor
    }

    /**
    * @dev Allows or restricts methods from being executed in takeAllPossible and takeAllOrRevert
    * @param _methodId bytes4 method id that will be allowed/forbidded from execution
    * @param _allowed bool
    */
    function allowOrRestrictMethod(
        bytes4 _methodId,
        bool _allowed
    )
        external
        onlyOwner
    {
        allowedMethods[_methodId] = _allowed;
    }

    /**
    * @dev Execute multiple order by given method id
    * @param _orderAddresses address[3][] representing
    * @param _orderValues uint256[4][] representing
    * @param _takerSellAmount uint256[] - amounts being asked from the taker, should be in tokens
    * @param _v uint8[] parameter parsed from the signature recovery
    * @param _r bytes32[] parameter parsed from the signature (from 0 to 32 bytes)
    * @param _s bytes32[] parameter parsed from the signature (from 32 to 64 bytes)
    */
    function takeAllOrRevert(
        address[3][] _orderAddresses,
        uint256[3][] _orderValues,
        uint256[] _takerSellAmount,
        uint8[] _v,
        bytes32[] _r,
        bytes32[] _s,
        bytes4 _methodId
    )
        external
    {
        require(
            allowedMethods[_methodId],
            "Can't call this method"
        );

        for (uint256 index = 0; index < _orderAddresses.length; index++) {
            require(
                address(this).delegatecall(
                _methodId,
                _orderAddresses[index],
                _orderValues[index],
                _takerSellAmount[index],
                _v[index],
                _r[index],
                _s[index]
                ),
                "Method call failed"
            );
        }
    }

    /**
    * @dev Execute multiple order by given method id
    * @param _orderAddresses address[3][]
    * @param _orderValues uint256[4][]
    * @param _takerSellAmount uint256[] - amounts being asked from the taker, should be in tokens
    * @param _v uint8[] parameter parsed from the signature recovery
    * @param _r bytes32[] parameter parsed from the signature (from 0 to 32 bytes)
    * @param _s bytes32[] parameter parsed from the signature (from 32 to 64 bytes)
    */
    function takeAllPossible(
        address[3][] _orderAddresses,
        uint256[3][] _orderValues,
        uint256[] _takerSellAmount,
        uint8[] _v,
        bytes32[] _r,
        bytes32[] _s,
        bytes4 _methodId
    )
        external
    {
        require(
            allowedMethods[_methodId],
            "Can't call this method"
        );

        for (uint256 index = 0; index < _orderAddresses.length; index++) {
            address(this).delegatecall(
            _methodId,
            _orderAddresses[index],
            _orderValues[index],
            _takerSellAmount[index],
            _v[index],
            _r[index],
            _s[index]
            );
        }
    }

    /**
    * @dev Execute buy order based on the order input parameters
    * and the signature from the maker's signing
    * @param _orderAddresses address[3] representing
    * [0] address of the order maker
    * [1] address of ether (0x0)
    * [2] address of token being bought
    * @param _orderValues uint256[4] representing
    * [0] amount in Ethers (wei)
    * [1] amount in tokens
    * [2] order nonce used for hash uniqueness
    * @param _takerSellAmount uint256 - amount being asked from the taker, should be in tokens
    * @param _v uint8 parameter parsed from the signature recovery
    * @param _r bytes32 parameter parsed from the signature (from 0 to 32 bytes)
    * @param _s bytes32 parameter parsed from the signature (from 32 to 64 bytes)
    */
    function takeBuyOrder(
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
            _orderAddresses[1] == ETH,
            "Base currency must be ether's (0x0)"
        );

        OrderLib.Order memory order = OrderLib.createOrder(_orderAddresses, _orderValues);
        uint256 receivedAmount = takeOrder(order, _takerSellAmount, _v, _r, _s);

        require(0 < receivedAmount, "Trade failure");

        updateVolume(receivedAmount);

        if (!isVolumeReached()) {
            takeFee(order.maker, msg.sender, order.makerBuyToken, _takerSellAmount, receivedAmount);
        }
    }

    /**
    * @dev Execute sell order based on the order input parameters
    * and the signature from the maker's signing
    * @param _orderAddresses address[3] representing
    * [0] address of the order maker
    * [1] address of token being sold
    * [2] address of ether (0x0)
    * @param _orderValues uint256[4] representing
    * [0] amount in tokens
    * [1] amount in Ethers (wei)
    * [2] order nonce used for hash uniqueness
    * @param _takerSellAmount uint256 - amount being asked from the taker, should be in ethers
    * @param _v uint8 parameter parsed from the signature recovery
    * @param _r bytes32 parameter parsed from the signature (from 0 to 32 bytes)
    * @param _s bytes32 parameter parsed from the signature (from 32 to 64 bytes)
    */
    function takeSellOrder(
        address[3] _orderAddresses,
        uint256[3] _orderValues,
        uint256 _takerSellAmount,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    )
        public
    {
        require(
            _orderAddresses[2] == ETH,
            "Base currency must be ether's (0x0)"
        );

        OrderLib.Order memory order = OrderLib.createOrder(_orderAddresses, _orderValues);

        uint256 receivedAmount = takeOrder(order, _takerSellAmount, _v, _r, _s);

        require(0 < receivedAmount, "Trade failure");

        updateVolume(_takerSellAmount);

        if (!isVolumeReached()) {
            takeFee(order.maker, msg.sender, order.makerSellToken, receivedAmount, _takerSellAmount);
        }
    }

    /**
    * @dev Takes fee for making/taking the order
    * @param _maker address
    * @param _taker address
    * @param _tokenAddress address
    * @param _tokenFulfilledAmount uint256 fulfilled amount in tokens
    * @param _etherFulfilledAmount uint256 fulfilled amount in ethers
    */
    function takeFee(
        address _maker,
        address _taker,
        address _tokenAddress,
        uint256 _tokenFulfilledAmount,
        uint256 _etherFulfilledAmount
    )
        private
    {
        uint256 _feeRate = feeRate; // gas optimization
        uint256 feeInWdx = _etherFulfilledAmount.calculateWdxFee(discountTokenRatio, feeRate);

        takeFee(_maker, ETH, _etherFulfilledAmount.div(_feeRate), feeInWdx);
        takeFee(_taker, _tokenAddress, _tokenFulfilledAmount.div(_feeRate), feeInWdx);
    }

    /**
    * @dev Takes fee in WDX or the given token address
    * @param _user address taker or maker
    * @param _tokenAddress address of the token
    * @param _tokenFeeAmount uint256 amount in given token address
    * @param _wdxFeeAmount uint256 amount in WDX tokens
    */
    function takeFee(
        address _user,
        address _tokenAddress,
        uint256 _tokenFeeAmount,
        uint256 _wdxFeeAmount
        )
        private
    {
        if(balances[discountTokenAddress][_user] >= _wdxFeeAmount) {
            takeFee(_user, discountTokenAddress, _wdxFeeAmount);
        } else {
            takeFee(_user, _tokenAddress, _tokenFeeAmount);
        }
    }

    /**
    * @dev Takes fee in WDX or the given token address
    * @param _user address taker or maker
    * @param _tokenAddress address
    * @param _fullFee uint256 fee taken from a given token address
    */
    function takeFee(
        address _user,
        address _tokenAddress,
        uint256 _fullFee
        )
        private
    {
        address _feeAccount = feeAccount; // gas optimization
        address referrer = getReferrer(_user);
        uint256 referralFee = _fullFee.calculateReferralFee(referralFeeRate);

        balances[_tokenAddress][_user] = balances[_tokenAddress][_user].sub(_fullFee);

        if(referrer == _feeAccount) {
            balances[_tokenAddress][_feeAccount] = balances[_tokenAddress][_feeAccount].add(_fullFee);
        } else {
            balances[_tokenAddress][_feeAccount] = balances[_tokenAddress][_feeAccount].add(_fullFee.sub(referralFee));
            balances[_tokenAddress][referrer] = balances[_tokenAddress][referrer].add(referralFee);
        }
        emit ReferralBalanceUpdated(referrer, _user, _tokenAddress, _fullFee, referralFee);
    }

}
