const ethers = require("ethers");
const assert = require("./assert").assertString;
const config = require("../config/config");
const etherAddress = config.etherAddress;

module.exports = {
    withdrawEthers,
    withdrawTokens,
    withdrawOldTokens
};

async function withdrawEthers(exchangeContract, wallet, amount) {
    const exchange = new ethers.Contract(exchangeContract.address, exchangeContract.abi, wallet);

    const balanceBefore = await exchange.balances(etherAddress, wallet.address);

    const ethValueForWithdraw = ethers.utils.parseEther(amount.toString(10));
    await exchange.withdrawEthers(ethValueForWithdraw.toString(10));

    const balanceAfter = await exchange.balances(etherAddress, wallet.address);

    assert(balanceAfter, balanceBefore.sub(ethValueForWithdraw));
}

async function withdrawTokens(exchangeContract, tokenContract, wallet, amount) {
    await _withdrawTokens(exchangeContract, tokenContract, wallet, amount, "withdrawTokens(address,uint256)");
}

async function withdrawOldTokens(exchangeContract, tokenContract, wallet, amount) {
    await _withdrawTokens(exchangeContract, tokenContract, wallet, amount, "withdrawOldTokens(address,uint256)");
}

async function _withdrawTokens(exchangeContract, tokenContract, wallet, amount, fn) {
    const exchange = new ethers.Contract(exchangeContract.address, exchangeContract.abi, wallet);
    const token = new ethers.Contract(tokenContract.address, tokenContract.abi, wallet);

    const userExchangeBalanceBefore = await exchange.balances(tokenContract.address, wallet.address);
    const userTokenBalanceBefore = await token.balanceOf(wallet.address);
    const exchangeTokenBalanceBefore = await token.balanceOf(exchangeContract.address);

    const decimals = await token.decimals();
    const withdrawAmount = ethers.utils.parseUnits(amount.toString(10), decimals);

    await exchange[fn](tokenContract.address, withdrawAmount.toString(10));

    const userExchangeBalanceAfter = await exchange.balances(tokenContract.address, wallet.address);
    const userTokenBalanceAfter = await token.balanceOf(wallet.address);
    const exchangeTokenBalanceAfter = await token.balanceOf(exchangeContract.address);

    assert(userExchangeBalanceAfter, userExchangeBalanceBefore.sub(withdrawAmount));
    assert(userTokenBalanceAfter, userTokenBalanceBefore.add(withdrawAmount));
    assert(exchangeTokenBalanceAfter, exchangeTokenBalanceBefore.sub(withdrawAmount));
}
