const { depositEthers, depositEthersWithReferral, depositTokens, depositTokensWithReferral } = require("./deposit");
const { withdrawEthers, withdrawTokens } = require("./withdraw");
const { takeBuyOrder, takeSellOrder, takeSellTokenOrder, getOrderHash, getSignature, constructOrder, cancelOrder } = require("./order");
const { deployToken, deployNewWeidexExchangeContract, deployWeiDexExchangeContract } = require("./deployer");
const { transferTokens, exchangeTransfer } = require("./transfer");

module.exports = {
    deployWeiDexExchangeContract,
    deployNewWeidexExchangeContract,
    deployToken,
    transferTokens,
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
    getOrderHash,
    takeSellTokenOrder,
    cancelOrder
};
