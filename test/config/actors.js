const wallet = require("../helper/wallet");

module.exports = {
    exchangeOwner: _createActor(0),
    tokenOwner: _createActor(1),
    alice: _createActor(2),
    evelyn: _createActor(3),
    george: _createActor(4),
    stan: _createActor(5),
    feeAccount: _createActor(6)
};

function _createActor(walletId) {
    return {
        wallet: wallet.getWallet(walletId),
        exchangeBalanceBefore: 0,
        exchangeBalanceAfter: 0,
        tokenBalanceBefore: 0,
        tokenBalanceAfter: 0
    };
}
