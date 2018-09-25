Withdraw
--------
There are two types of withdraws - :ref:`withdrawEthers <withdraw-ethers>` and :ref:`withdrawTokens <withdraw-tokens>`.

.. _withdraw-ethers:

withdrawEthers
~~~~~~~~~~~~~~

Function prototype:

::

    function withdrawEthers(uint256 _amount)

Parameters:

+-------------------+-----------+--------------------------------------------------------------+
| Parameter         |     Type  |             Description                                      |
+===================+===========+==============================================================+
| _amount           | uint256   | Amount to be withdrawn.                                      |
+-------------------+-----------+--------------------------------------------------------------+

``withdrawEthers`` will revert if the caller of the function has less balance than the requested amount

If successful, ``withdrawEthers`` will emit a **Withdraw event**.

::

    event Withdraw(
        address indexed tokenAddress,
        address indexed user,
        uint256 amount,
        uint256 balance
    );


.. _withdraw-tokens:

withdrawTokens
~~~~~~~~~~~~~~

Function prototype:

::

    function withdrawTokens(
        address _tokenAddress,
        uint256 _amount
    )

Parameters:

+-------------------+-----------+--------------------------------------------------------------+
| Parameter         |     Type  |             Description                                      |
+===================+===========+==============================================================+
| _tokenAddress     | address   | Address of token being withdrawn.                            |
+-------------------+-----------+--------------------------------------------------------------+
| _amount           | uint256   | Amount to be withdrawn.                                      |
+-------------------+-----------+--------------------------------------------------------------+

``withdrawTokens`` will update the internal Smart Contract state by adding the amount to the specified token address.


If successful, ``withdrawTokens`` will emit a **Withdraw event**.

::

    event Withdraw(
        address indexed tokenAddress,
        address indexed user,
        uint256 amount,
        uint256 balance
    );
