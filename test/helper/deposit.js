const ethers = require("ethers");
const assert = require("./assert").assertString;
const config = require("../config/config");
const etherAddress = config.etherAddress;

module.exports = {
    depositEthers,
    depositEthersWithReferral,
    depositTokens,
    depositTokensWithReferral
};

async function depositEthers(exchangeContract, wallet, amount) {
    const exchange = new ethers.Contract(exchangeContract.address, exchangeContract.abi, wallet);

    const balanceBefore = await exchange.balances(etherAddress, wallet.address);

    const ethValueToDeposit = ethers.utils.parseEther(amount.toString(10));
    const options = {
        value: ethValueToDeposit
    };
    await exchange["depositEthers()"](options);
    const balanceAfter = await exchange.balances(etherAddress, wallet.address);
    assert(balanceAfter, ethValueToDeposit.add(balanceBefore));
}

async function depositEthersWithReferral(exchangeContract, wallet, amount, referral) {
    const exchange = new ethers.Contract(exchangeContract.address, exchangeContract.abi, wallet);

    const balanceBefore = await exchange.balances(etherAddress, wallet.address);

    const ethValueToDeposit = ethers.utils.parseEther(amount.toString(10));
    const options = {
        value: ethValueToDeposit
    };
    await exchange.functions.depositEthers(referral.address, options);
    const balanceAfter = await exchange.balances(etherAddress, wallet.address);
    assert(balanceAfter, ethValueToDeposit.add(balanceBefore));

    const referralAddress = await exchange.referrals(wallet.address);
    assert(referralAddress, referral.address);
}

async function depositTokens(wallet, tokenContract, exchangeContract, amount) {
    const token = new ethers.Contract(tokenContract.address, tokenContract.abi, wallet);
    const exchange = new ethers.Contract(exchangeContract.address, exchangeContract.abi, wallet);

    const decimals = await token.decimals();
    const depositAmount = ethers.utils.parseUnits(amount.toString(10), decimals);
    await token.approve(exchangeContract.address, depositAmount);

    const balanceBefore = await exchange.balances(tokenContract.address, wallet.address);

    await exchange.functions["depositTokens(address,uint256)"](tokenContract.address, depositAmount);

    const balanceAfter = await exchange.balances(tokenContract.address, wallet.address);
    assert(balanceAfter, depositAmount.add(balanceBefore));
}

async function depositTokensWithReferral(wallet, tokenContract, exchangeContract, amount, referral) {
    const token = new ethers.Contract(tokenContract.address, tokenContract.abi, wallet);
    const exchange = new ethers.Contract(exchangeContract.address, exchangeContract.abi, wallet);

    const decimals = await token.decimals();
    const depositAmount = ethers.utils.parseUnits(amount.toString(10), decimals);
    await token.approve(exchangeContract.address, depositAmount);

    const balanceBefore = await exchange.balances(tokenContract.address, wallet.address);

    await exchange.functions["depositTokens(address,uint256,address)"](tokenContract.address, depositAmount, referral.address);

    const balanceAfter = await exchange.balances(tokenContract.address, wallet.address);

    const referralAddress = await exchange.referrals(wallet.address);

    assert(balanceAfter, depositAmount.add(balanceBefore));
    assert(referralAddress, referral.address);
}
