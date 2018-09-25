Deposit
-------
There are two types of deposit - :ref:`depositEthers <deposit-ethers>` and :ref:`depositTokens <deposit-tokens>`.

.. _deposit-ethers:

depositEthers
~~~~~~~~~~~~~

Function prototype:

::

    function depositEthers() payable

``depositEthers`` will keep the amount in msg.value (i.e. the amount of transferred ETH) into the smart contract internal state.

If successful, ``depositEthers`` will emit a **Deposit event**.

::

    event Deposit(
        address indexed tokenAddress,
        address indexed user,
        uint256 amount,
        uint256 balance
    );


.. _deposit-tokens:

depositTokens
~~~~~~~~~~~~~

Function prototype:

::

    function depositTokens(
        address _tokenAddress,
        uint256 _amount
    )

Parameters:

+-------------------+-----------+--------------------------------------------------------------+
| Parameter         |     Type  |             Description                                      |
+===================+===========+==============================================================+
| _tokenAddress     | address   | Address of token being deposited.                            |
+-------------------+-----------+--------------------------------------------------------------+
| _amount           | uint256   | Amount to be deposited.                                      |
+-------------------+-----------+--------------------------------------------------------------+

``depositTokens`` will update the internal Smart Contract state by adding the amount to the specified token address.


If successful, ``depositTokens`` will emit a **Deposit event**.

::

    event Deposit(
        address indexed tokenAddress,
        address indexed user,
        uint256 amount,
        uint256 balance
    );
