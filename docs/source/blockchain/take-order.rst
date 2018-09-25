Take Order
----------

A trade is initiated when one of the following functions is executed in the Smart Contract: :ref:`takeBuyOrder <take-buy-order-label>` and :ref:`takeSellOrder <take-sell-order-label>`.

.. _take-buy-order-label:

takeBuyOrder
~~~~~~~~~~~~
This function will attempt to fill the amount specified by the caller (i.e. order taker).
Partial fills are allowed when taking orders.
After the execution of this function the **order maker**
will have **more tokens** and **less ETH**, while **order taker** will have **less tokens** and **more ETH**.

Function prototype:

::

    function takeBuyOrder(
        address[3] _orderAddresses,
        uint256[3] _orderValues,
        uint256 _takerSellAmount,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    );

Parameters:

+-------------------+-----------+--------------------------------------------------------------+
| Parameter         |     Type  |             Description                                      |
+===================+===========+==============================================================+
| _orderAddresses[0]| address   | Address that created the order.                              |
+-------------------+-----------+--------------------------------------------------------------+
| _orderAddresses[1]| address   | Address of Ether address(0x0).                               |
+-------------------+-----------+--------------------------------------------------------------+
| _orderAddresses[2]| address   | Address of Token being bought.                               |
+-------------------+-----------+--------------------------------------------------------------+
| _orderValues[0]   | uint256   | Amount in Ethers (wei).                                      |
+-------------------+-----------+--------------------------------------------------------------+
| _orderValues[1]   | uint256   | Amount in Tokens * decimals.                                 |
+-------------------+-----------+--------------------------------------------------------------+
| _orderValues[2]   | uint256   | Order nonce used for uniqueness.                             |
+-------------------+-----------+--------------------------------------------------------------+
| _takerSellAmount  | uint256   | Amount being asked by taker (in Tokens).                     |
+-------------------+-----------+--------------------------------------------------------------+
| _v                | uint8     | Parameter parsed from the signature 1b or 1c.                |
+-------------------+-----------+--------------------------------------------------------------+
| _r                | bytes32   | Parameter parsed from the signature (from 0 to 32 bytes).    |
+-------------------+-----------+--------------------------------------------------------------+
| _s                | bytes32   | parameter parsed from the signature (from 32 to 64 bytes).   |
+-------------------+-----------+--------------------------------------------------------------+

takeBuyOrder will revert under the following conditions:
    * _orderAddresses[1] is different than address(0x0)
    * an invalid signature is submitted (i.e. invalid order parameters or invalid _v, _r, _s)
    * function caller (i.e. order taker) has insufficient balance
    * order taker has insufficient balance
    * order is already filled or the requested amount is more than the fulfillable amount.

On successful execution **TakeOrder event** is emited:

::

    event TakeOrder(
        address indexed maker,
        address taker,
        address indexed makerBuyToken,
        address indexed makerSellToken,
        uint256 takerGivenAmount,
        uint256 takerReceivedAmount,
        bytes32 orderHash,
        uint256 nonce
    );

.. _take-sell-order-label:

takeSellOrder
~~~~~~~~~~~~~
This function will attempt to fill the amount specified by the caller (i.e. order taker).
Partial fills are allowed when taking orders.
After the execution of this function the **order maker**
will have **more ETH** and **less tokens**, while **order taker** will have **less ETH** and **more tokens**.

Function prototype:

::

    function takeSellOrder(
            address[3] _orderAddresses,
            uint256[3] _orderValues,
            uint256 _takerSellAmount,
            uint8 _v,
            bytes32 _r,
            bytes32 _s
        );

Parameters:

+-------------------+-----------+--------------------------------------------------------------+
| Parameter         |     Type  |             Description                                      |
+===================+===========+==============================================================+
| _orderAddresses[0]| address   | Address that created the order.                              |
+-------------------+-----------+--------------------------------------------------------------+
| _orderAddresses[1]| address   | Address of Token being bought.                               |
+-------------------+-----------+--------------------------------------------------------------+
| _orderAddresses[2]| address   | Address of Ether address(0x0).                               |
+-------------------+-----------+--------------------------------------------------------------+
| _orderValues[0]   | uint256   | Amount in Tokens * decimals.                                 |
+-------------------+-----------+--------------------------------------------------------------+
| _orderValues[1]   | uint256   | Amount in Ethers (wei).                                      |
+-------------------+-----------+--------------------------------------------------------------+
| _orderValues[2]   | uint256   | Order nonce used for uniqueness.                             |
+-------------------+-----------+--------------------------------------------------------------+
| _takerSellAmount  | uint256   | Amount being asked by taker (in Ethers).                     |
+-------------------+-----------+--------------------------------------------------------------+
| _v                | uint8     | Parameter parsed from the signature 1b or 1c.                |
+-------------------+-----------+--------------------------------------------------------------+
| _r                | bytes32   | Parameter parsed from the signature (from 0 to 32 bytes).    |
+-------------------+-----------+--------------------------------------------------------------+
| _s                | bytes32   | parameter parsed from the signature (from 32 to 64 bytes).   |
+-------------------+-----------+--------------------------------------------------------------+

takeSellOrder will revert under the following conditions:
    * _orderAddresses[2] is different than address(0x0)
    * an invalid signature is submitted (i.e. invalid order parameters or invalid _v, _r, _s)
    * function caller (i.e. order taker) has insufficient balance
    * order taker has insufficient balance
    * order is already filled or the requested amount is more than the fulfillable amount.

On successful execution **TakeOrder event** is emited:

::

    event TakeOrder(
        address indexed maker,
        address taker,
        address indexed makerBuyToken,
        address indexed makerSellToken,
        uint256 takerGivenAmount,
        uint256 takerReceivedAmount,
        bytes32 orderHash,
        uint256 nonce
    );
