const { depositEthers, depositEthersWithReferral, depositTokens, depositTokensWithReferral } = require("./deposit");
const { withdrawEthers, withdrawTokens } = require("./withdraw");
const { createOrder, takeBuyOrder, takeBuyTokenOrder, takeSellOrder, takeSellTokenOrder, getOrderHash, getSignature, constructOrder, cancelOrder } = require("./order");
const { deployToken, deployNewWeidexExchangeContract, deployWeiDexExchangeContract } = require("./deployer");
const { transferTokens, transferTokensFor, exchangeTransfer } = require("./transfer");

module.exports = {
    deployWeiDexExchangeContract,
    deployNewWeidexExchangeContract,
    deployToken,
    transferTokens,
    transferTokensFor,
    exchangeTransfer,
    depositTokens,
    depositTokensWithReferral,
    depositEthers,
    depositEthersWithReferral,
    withdrawEthers,
    withdrawTokens,
    getSignature,
    constructOrder,
    takeSellOrder,
    takeBuyOrder,
    takeBuyTokenOrder,
    getOrderHash,
    takeSellTokenOrder,
    cancelOrder,
    createOrder
};
