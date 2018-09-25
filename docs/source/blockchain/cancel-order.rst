Cancel Order
------------
``cancelOrder`` cancels the specified order. Partial cancels are not allowed.


Function prototype:

::

    function cancelOrder(
        address[3] _orderAddresses,
        uint256[3] _orderValues,
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
| _orderAddresses[1]| address   | Address of sell token.                                       |
+-------------------+-----------+--------------------------------------------------------------+
| _orderAddresses[2]| address   | Address of buy token.                                        |
+-------------------+-----------+--------------------------------------------------------------+
| _orderValues[0]   | uint256   | Amount in sell token.                                        |
+-------------------+-----------+--------------------------------------------------------------+
| _orderValues[1]   | uint256   | Amount in buy token        .                                 |
+-------------------+-----------+--------------------------------------------------------------+
| _orderValues[2]   | uint256   | Order nonce used for uniqueness.                             |
+-------------------+-----------+--------------------------------------------------------------+
| _v                | uint8     | Parameter parsed from the signature 1b or 1c.                |
+-------------------+-----------+--------------------------------------------------------------+
| _r                | bytes32   | Parameter parsed from the signature (from 0 to 32 bytes).    |
+-------------------+-----------+--------------------------------------------------------------+
| _s                | bytes32   | parameter parsed from the signature (from 32 to 64 bytes).   |
+-------------------+-----------+--------------------------------------------------------------+

``cancelOrder`` will revert if the caller of the function is different
from the address after recovering with the signature i.e. only order maker can cancel it.

If successful, ``cancelOrder`` will emit a **Cancel event**.

::

    event CancelOrder(
        address indexed makerBuyToken,
        address indexed makerSellToken,
        address indexed maker,
        bytes32 orderHash,
        uint256 nonce
    );
