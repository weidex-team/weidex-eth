const ethers = require("ethers");
const assert = require("./assert").assertString;
const config = require("../config/config");
const etherAddress = config.etherAddress;

module.exports = {
    withdrawEthers,
    withdrawTokens
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
    const exchange = new ethers.Contract(exchangeContract.address, exchangeContract.abi, wallet);

    const token = new ethers.Contract(tokenContract.address, tokenContract.abi, wallet);

    const exchangeBalanceBefore = await exchange.balances(tokenContract.address, wallet.address);

    const tokenBalanceBefore = await token.balanceOf(tokenContract.address);

    const decimals = await token.decimals();
    const withdrawAmount = ethers.utils.parseUnits(amount.toString(10), decimals);

    await exchange.withdrawTokens(tokenContract.address, withdrawAmount.toString(10));

    const tokenBalanceAfter = await token.balanceOf(wallet.address);
    const exchangeBalanceAfter = await exchange.balances(tokenContract.address, wallet.address);

    assert(exchangeBalanceAfter, exchangeBalanceBefore.sub(withdrawAmount));
    assert(tokenBalanceAfter, tokenBalanceBefore.add(withdrawAmount));
}
