Smart Contracts
===========================

.. toctree::
   :maxdepth: 2

Architecture
------------
WeiDex uses a numerous Ethereum Smart Contracts (currently written in Solidity), 
splitting the logic into a separated modules.
Thus, modules can be upgraded separately. Modularity is achieved through inheritance for now.
The Upgradability is achieved through a separate Smart Contract
and users could choose to use the new version for himself or stick with the old one. The detailed explanation about the upgrade process will be provided soon.
	
.. image:: pics/architecture.png