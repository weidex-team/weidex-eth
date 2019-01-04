/user/{address}
----------------

Fetch user object by given user address.

Parameters:
    * ``address`` – address of the user

**Returns:**
::

    {
        "id":3,
        "address":"0xac5e37db1c85bfc3e6474755ed77cff76d81eb67",
        "nextNonce":4,
        "deposited":true
    }

/token/all
----------

Fetch all tokens, which we operate with.

Parameters:
    * ``None``

**Returns:**
::

    [
        {
            "id":0,
            "name":"WDX",
            "fullName":"WeiDexToken",
            "decimals":18,
            "address":"0x5a0e34f6db3a15131bf9a16cea1766ac018580e4",
            "type":"ERC20"
        },
        {
            "id":1,
            "name":"OMG",
            "fullName":"OmiseGo",
            "decimals":18,
            "address":"0x419d652028faaadb9c98fcd09d7a2b6fd82e9968",
            "type":"OldERC20"
        }
    ]

``type`` can have one of the following values:
::

    "ERC20", "OldERC20"

/balance/user/{userAddress}
---------------------------

Fetch all balances for given user address

Parameters:
    * ``userAddress`` – address of the user in the blockchain

**Returns:**
::

    [
        {
            "tokenName":"WDX",
            "userAddress":"0xac5e37db1c85bfc3e6474755ed77cff76d81eb67",
            "fullAmount":3000600000000000000,
            "availableAmount":2900600000000000000
        },
        {
            "tokenName":"OMG",
            "userAddress":"0xac5e37db1c85bfc3e6474755ed77cff76d81eb67",
            "fullAmount":0,
            "availableAmount":0
        }
    ]

/deposit/user/{id}
------------------

Fetch all deposits for a user by given user id

Parameters:
    * ``id`` – user id

**Returns:**
::

    [
        {
            "amount":1000000000000000000,
            "txHash":"0x9978f7196e1ccb46e16605da4f65623245ff6cebb97454940ecfc42e10381cd4",
            "status":"SUCCESS",
            "tokenName":"ETH",
            "createdAt":"2018-10-01T15:13:25.000+0000"
        },
        {
            "amount":500000000000000000,
            "txHash":"0x832981e52efac16b107d4ce3cc87c3e10e599b9ba9635da5ea3cc4bc50e0b841",
            "status":"SUCCESS",
            "tokenName":"WDX",
            "createdAt":"2018-10-01T17:13:25.000+0000"
        }
    ]

``status`` can have one of the following values:
::

    "PENDING", "SUCCESS", "FAILED"

/withdraw/user/{id}
-------------------

Fetch all withdraws for a user by given user id

Parameters:
    * ``id`` – user id

**Returns:**
::

    [
        {
            "amount":10000000000000000,
            "txHash":"0xe564568332ad2901c5cceaaa828dd7d1cb0f39bd1cf05a0f361ec4cd808b8586",
            "status":"SUCCESS",
            "tokenName":"ETH"
        },
        {
            "amount":300000000000000,
            "txHash":"0xe7b5da58fbd6e5616f6f5813898f817c2744e9057532f530b5497337eae3275b",
            "status":"PENDING",
            "tokenName":"WDX"
        }
    ]

``status`` can have one of the following values:
::

    "PENDING", "SUCCESS", "FAILED"

/order/user/{userId}/token/{tokenId}
--------------------------------------

Fetch open user orders for given token.

Parameters:
    * ``userId`` – id of a user, which orders we want
    * ``tokenId`` – id of a token, which orders we want

**Returns:**
::

    [
        {
            "id":1,
            "orderHash":"0xdb1eed918bd03cd068ac87f0bc42957541efe130f8845b5de641ac56def34635",
            "signature":"0xa6953783bfc254e2ba70ac0fdce2dda66976ac0e8dc2213c47403dfa540a179901f0d62a01f8b1ccf4502050e976e256240e8f28b8bb208638e0e1f33eca4b941b",
            "fullAmount":1000000000000000000,
            "filledAmount":0,
            "price":0.10000000,
            "nonce":0,
            "type":"BUY",
            "status":"OPEN"
        }
    ]

``status`` can have one of the following values:
::

	OPEN, PARTIALLY_FILLED, FILLED, CANCELED, ERROR

``type`` can have one of the following values:
::

	BUY, SELL

/order/open/token/{tokenId}/type/{type}
---------------------------------------

Fetch open orders for given token and order type.

Parameters:
    * ``tokenId`` – id of a token, which orders we want
    * ``type`` – type of the orders we want. Possible types are “BUY” and “SELL”

**Returns:**
::

    [
        {
            "id":1,
            "orderHash":"0xdb1eed918bd03cd068ac87f0bc42957541efe130f8845b5de641ac56def34635",
            "signature":"0xa6953783bfc254e2ba70ac0fdce2dda66976ac0e8dc2213c47403dfa540a179901f0d62a01f8b1ccf4502050e976e256240e8f28b8bb208638e0e1f33eca4b941b",
            "makerAddress":"0xac5e37db1c85bfc3e6474755ed77cff76d81eb67",
            "fullAmount":1000000000000000000,
            "filledAmount":0,
            "price":0.10000000,
            "nonce":0,
            "status":"OPEN",
            "type":"BUY",
            "createdAt":"2018-09-21T14:10:10.000+0000"
        }
    ]

``status`` can have one of the following values:
::

	OPEN, PARTIALLY_FILLED, FILLED, CANCELED, ERROR

``type`` can have one of the following values:
::

	BUY, SELL

/orderHistory/user/{userId}/token/{tokenId}
-------------------------------------------

Fetch hisotry of orders for a given user and token.

Parameters:
    * ``userId`` – id of a user, which orders we want
    * ``tokenId`` – id of a token, which orders we want

**Returns:**
::

    [
        {
            "id":1,
            "type":"SELL",
            "amount":10000000000000000,
            "price":0.01000000,
            "nonce":1,
            "status":"FILLED",
            "txHash":"0x48602247890c89ac650a75fb399b4b8852e6f52b43ceb2adff2fd3572b3740c2",
            "makerAddress":"0x2156b0acbb9ae3cee0451f489cd42477c427072a",
            "takerAddress":"0x7dd931c588e3e61acdef15b2ef7ede8cee405f5a"
        }
    ]

``status`` can have one of the following values:
::

	OPEN, PARTIALLY_FILLED, FILLED, CANCELED, ERROR

``type`` can have one of the following values:
::

	BUY, SELL

/orderHistory/user/{userId}
---------------------------

Fetch hisotry of orders for a given user. User can be both maker or taker.

Parameters:
    * ``userId`` – id of a user, which orders we want

**Returns:**
::

    [
        {
            "id":10,
            "token":{
                "id":3,
                "name":"wdxb",
                "fullName":"WeiDexBeta",
                "decimals":18,
                "address":"0x5a0e34f6db3a15131bf9a16cea1766ac018580e4",
                "type":"ERC20"
            },
            "type":"SELL",
            "amount":10000000000000000,
            "price":0.03000000,
            "nonce":3,
            "status":"FILLED",
            "txHash":"0x0bae74dfad8fa381a273c124247e43579e6a6e44555e66290e6157d9f998911f",
            "createdAt":"2018-09-24T12:04:26.000+0000",
            "makerAddress":"0xc24f6b6cc5142c13ae04fe99f971d1d4723aa37a",
            "takerAddress":"0x2156b0acbb9ae3cee0451f489cd42477c427072a"
        }
    ]

``status`` can have one of the following values:
::

	OPEN, PARTIALLY_FILLED, FILLED, CANCELED, ERROR

``type`` can have one of the following values:
::

	BUY, SELL

/orderHistory/token/{tokenId}
-----------------------------

Fetch hisotry of orders for a given token. Returns only filled order.

Parameters:
    * ``tokenId`` – id of a token, for which orders we want

**Returns:**
::

    [
        {
            "type":"SELL",
            "amount":10000000000000000,
            "price":0.03000000,
            "createdAt":"2018-09-24T12:04:26.000+0000",
            "txHash":"0x0bae74dfad8fa381a273c124247e43579e6a6e44555e66290e6157d9f998911f",
            "status":"FILLED",
            "makerAddress":"0xc24f6b6cc5142c13ae04fe99f971d1d4723aa37a",
            "takerAddress":"0x2156b0acbb9ae3cee0451f489cd42477c427072a",
            "tokenName":"WDX"
        },
        {
            "type":"BUY",
            "amount":3000000000000000000,
            "price":0.01000000,
            "createdAt":"2018-09-24T11:26:39.000+0000",
            "txHash":"0x313ffd9fbbf6d141666ad21c54469badbee4c395929c2f984abba8ff22f3eaca",
            "status":"FILLED",
            "makerAddress":"0x2156b0acbb9ae3cee0451f489cd42477c427072a",
            "takerAddress":"0xa97c7af62d2beeea77a292e3e3460b086396dc26",
            "tokenName":"AE"
        }
    ]

/ticker/token/{tokenId}
-----------------------------

Get ticker for a given listed token.

Parameters:
    * ``tokenId`` – id of a token, for which ticker we want

**Returns:**
::

    {
        "quoteName":"WDX",
        "baseName":"ETH",
        "quoteVolume":1234.23,
        "baseVolume":8.392764,
        "last":0.00680999,
        "highestBid":0.0067,
        "lowestAsk":0.00680999,
        "updatedAt":"2018-01-03T10:33:47.000+0000"
    }

/ticker/all
-----------------------------

Get tickers for all listed tokens.

**Returns:**
::

    {
        "AE_ETH":
        {
            "quoteName":"AE",
            "baseName":"ETH",
            "quoteVolume":0,
            "baseVolume":0,
            "last":0.00680999,
            "highestBid":0.00665,
            "lowestAsk":0.00675,
            "updatedAt":"2018-01-03T08:15:41.000+0000"
        },
        "SCAVO_ETH":
        {
            "quoteName":"SCAVO",
            "baseName":"ETH",
            "quoteVolume":0,
            "baseVolume":0,
            "last":0.00001200,
            "highestBid":0.00001020,
            "lowestAsk":0.00006000,
            "updatedAt":"2018-01-03T23:41:52.000+0000"
        }
    }
    