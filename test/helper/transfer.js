const assert = require("./assert").assertString;
const ethers = require("ethers");

module.exports = { transferTokens };

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
