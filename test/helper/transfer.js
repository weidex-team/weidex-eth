const assert = require("./assert").assertString;
const ethers = require("ethers");

module.exports = { transferTokens, exchangeTransfer };

async function transferTokens(tokenContract, wallet, amount) {
    const token = new ethers.Contract(tokenContract.address, tokenContract.abi, wallet);

    const balanceBefore = await token.balanceOf(wallet.address);
    assert(balanceBefore, 0);

    const decimals = await token.decimals();
    const transferAmount = ethers.utils.parseUnits(amount.toString(10), decimals);
    await token.functions.mint(wallet.address, transferAmount);

    const balanceAfter = await token.balanceOf(wallet.address);
    assert(balanceAfter, transferAmount);
}

async function exchangeTransfer(exchangeContract, token, to, amount, fn) {
    const transferAmount = await functions[fn](amount, token);
    await exchangeContract.transfer(token.address, to, transferAmount);
}

const functions = {
    ethers: _getEthAmount,
    tokens: _getTokenAmount
};

async function _getEthAmount(amount) {
    return ethers.utils.parseEther(amount.toString(10));
}

async function _getTokenAmount(amount, token) {
    const decimals = await token.decimals();
    return ethers.utils.parseUnits(amount.toString(10), decimals);
}
