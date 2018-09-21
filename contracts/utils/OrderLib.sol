pragma solidity 0.4.24;

library OrderLib {

    struct Order {
        uint256 makerSellAmount;
        uint256 makerBuyAmount;
        uint256 nonce;
        address maker;
        address makerSellToken;
        address makerBuyToken;
    }

    /**
    * @dev Hashes the order.
    * @param order Order to be hashed.
    * @return hash result
    */
    function createHash(Order memory order)
        internal
        view
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                order.maker,
                order.makerSellToken,
                order.makerSellAmount,
                order.makerBuyToken,
                order.makerBuyAmount,
                order.nonce,
                this
            )
        );
    }

    /**
    * @dev Creates order struct from value arrays.
    * @param addresses Array of trade's maker, makerToken and takerToken.
    * @param values Array of trade's makerTokenAmount, takerTokenAmount, expires and nonce.
    * @return Order struct
    */
    function createOrder(
        address[3] addresses,
        uint256[3] values
    )
        internal
        pure
        returns (Order memory)
    {
        return Order({
            maker: addresses[0],
            makerSellToken: addresses[1],
            makerSellAmount: values[0],
            makerBuyToken: addresses[2],
            makerBuyAmount: values[1],
            nonce: values[2]
        });
    }

}
