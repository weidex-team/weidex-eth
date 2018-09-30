const ethers = require("ethers");
const assert = require("./assert").assertString;
const config = require("../config/config");
const etherAddress = config.etherAddress;

module.exports = {
    depositEthers,
    depositEthersFor,
    depositEthersWithReferral,
    depositTokens,
    depositTokensFor,
    depositTokensWithReferral
};

async function depositEthersWithReferral(exchangeContract, wallet, amount, referral) {
    await _depositEthers(exchangeContract, wallet, amount, wallet.address, "depositEthers(address)", [referral.address]);
    const exchange = new ethers.Contract(exchangeContract.address, exchangeContract.abi, wallet);
    const referralAddress = await exchange.referrals(wallet.address);
    assert(referralAddress, referral.address);
}

async function depositEthersFor(exchangeContract, wallet, amount, beneficiary) {
    await _depositEthers(exchangeContract, wallet, amount, beneficiary, "depositEthersFor(address)", [beneficiary]);
}

async function depositEthers(exchangeContract, wallet, amount) {
    await _depositEthers(exchangeContract, wallet, amount, wallet.address, "depositEthers()", []);
}

async function depositTokensFor(wallet, tokenContract, exchangeContract, amount, beneficiary) {
    const approvedTokens = await _approveTokensForTransfer(tokenContract, wallet, amount, exchangeContract.address);
    await _depositTokens(wallet, tokenContract, exchangeContract, approvedTokens, beneficiary,
        "depositTokensFor(address,uint256,address)", [tokenContract.address, approvedTokens, beneficiary] )
}

async function depositTokens(wallet, tokenContract, exchangeContract, amount) {
    const approvedTokens = await _approveTokensForTransfer(tokenContract, wallet, amount, exchangeContract.address);
    await _depositTokens(wallet, tokenContract, exchangeContract, approvedTokens, wallet.address,
        "depositTokens(address,uint256)", [tokenContract.address, approvedTokens] );
}

async function depositTokensWithReferral(wallet, tokenContract, exchangeContract, amount, referral) {
    const exchange = new ethers.Contract(exchangeContract.address, exchangeContract.abi, wallet);
    const approvedTokens = await _approveTokensForTransfer(tokenContract, wallet, amount, exchangeContract.address);
    await _depositTokens(wallet, tokenContract, exchangeContract, approvedTokens, wallet.address,
        "depositTokens(address,uint256,address)", [tokenContract.address, approvedTokens, referral.address] );

    const referralAddress = await exchange.referrals(wallet.address);
    assert(referralAddress, referral.address);
}

async function _approveTokensForTransfer(tokenContract, wallet, amount, exchange) {
    const token = new ethers.Contract(tokenContract.address, tokenContract.abi, wallet);

    const decimals = await token.decimals();

    const depositAmount = ethers.utils.parseUnits(amount.toString(10), decimals);

    await token.approve(exchange, depositAmount);

    return depositAmount;
}

async function _depositTokens(wallet, tokenContract, exchangeContract, depositAmount, beneficiary, fn, args) {
    const exchange = new ethers.Contract(exchangeContract.address, exchangeContract.abi, wallet);

    const balanceBefore = await exchange.balances(tokenContract.address, beneficiary);

    await exchange.functions[fn](...args);

    const balanceAfter = await exchange.balances(tokenContract.address, beneficiary);

    assert(balanceAfter, depositAmount.add(balanceBefore));
}

async function _depositEthers(exchangeContract, wallet, amount, beneficiary, fn, args) {
    const exchange = new ethers.Contract(exchangeContract.address, exchangeContract.abi, wallet);

    const balanceBefore = await exchange.balances(etherAddress, beneficiary);

    const ethValueToDeposit = ethers.utils.parseEther(amount.toString(10));

    const options = {
        value: ethValueToDeposit
    };

    await exchange[fn](...args, options);

    const balanceAfter = await exchange.balances(etherAddress, beneficiary);

    assert(balanceAfter, ethValueToDeposit.add(balanceBefore));
}