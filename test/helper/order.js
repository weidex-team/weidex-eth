const ethers = require("ethers");
const Web3 = require("web3");

const config = require("../config/config");
const etherAddress = config.etherAddress;
const web3 = new Web3(new Web3.providers.HttpProvider(config.host));

module.exports = {
    takeBuyOrder,
    getOrderHash,
    getSignature,
    constructOrder,
    takeSellOrder,
    takeSellTokenOrder,
    cancelOrder
};

async function takeSellTokenOrder(maker, taker, token, tokenAmount, etherAmount, nonce, exchange, takerSellAmount) {
    await _takeSellOrder(maker, taker, token, tokenAmount, etherAmount, nonce, exchange, takerSellAmount, "takeSellTokenOrder");
}

async function takeSellOrder(maker, taker, token, tokenAmount, etherAmount, nonce, exchange, takerSellAmount) {
    await _takeSellOrder(maker, taker, token, tokenAmount, etherAmount, nonce, exchange, takerSellAmount, "takeSellOrder");
}

async function takeBuyOrder(maker, taker, token, tokenAmount, etherAmount, nonce, exchange, takerSellAmount) {
    await _takeBuyOrder(maker, taker, token, tokenAmount, etherAmount, nonce, exchange, takerSellAmount, "takeBuyOrder");
}

function getOrderHash(order) {
    const orderHash = ethers.utils.solidityKeccak256(
        ["address", "address", "uint256", "address", "uint256", "uint256", "address"],
        [order.maker, order.sellTokenAddress, order.sellTokenAmount, order.buyTokenAddress, order.buyTokenAmount, order.nonce, order.contractAddress]
    );
    return orderHash;
}

function getSignature(order, wallet) {
    const orderHash = getOrderHash(order);
    const signature = ethers.utils.splitSignature(web3.eth.sign(wallet.address, orderHash));
    return signature;
}

function constructOrder(maker, sellTokenAddress, sellTokenAmount, buyTokenAddress, buyTokenAmount, nonce, contractAddress) {
    return {
        maker,
        sellTokenAddress,
        sellTokenAmount,
        buyTokenAddress,
        buyTokenAmount,
        nonce,
        contractAddress
    };
}

async function _takeSellOrder(maker, taker, token, tokenAmount, etherAmount, nonce, exchange, takerSellAmount, fn) {
    const tokenContract = new ethers.Contract(token.address, token.abi, maker);
    const exchangeContract = new ethers.Contract(exchange.address, exchange.abi, taker);

    const decimals = await tokenContract.decimals();

    const tokens = ethers.utils.parseUnits(tokenAmount.toString(10), decimals);
    const eth = ethers.utils.parseEther(etherAmount.toString(10));
    const sellAmount = ethers.utils.parseEther(takerSellAmount.toString(10));

    const order = constructOrder(maker.address, token.address, tokens.toString(10), etherAddress, eth.toString(10), nonce, exchange.address);

    const signature = getSignature(order, maker);

    await exchangeContract.functions[fn](
        [maker.address, token.address, etherAddress],
        [tokens.toString(10), eth.toString(10), nonce],
        sellAmount.toString(10),
        signature.v,
        signature.r,
        signature.s
    );
}

async function _takeBuyOrder(maker, taker, token, tokenAmount, etherAmount, nonce, exchange, takerSellAmount, fn) {
    const tokenContract = new ethers.Contract(token.address, token.abi, maker);
    const exchangeContract = new ethers.Contract(exchange.address, exchange.abi, taker);

    const decimals = await tokenContract.decimals();

    const tokens = ethers.utils.parseUnits(tokenAmount.toString(10), decimals);
    const eth = ethers.utils.parseEther(etherAmount.toString(10));
    const sellAmount = ethers.utils.parseEther(takerSellAmount.toString(10));

    const order = constructOrder(maker.address, etherAddress, eth.toString(10), token.address, tokens.toString(10), nonce, exchange.address);

    const signature = getSignature(order, maker);

    await exchangeContract.functions[fn](
        [maker.address, etherAddress, token.address],
        [eth.toString(10), tokens.toString(10), nonce],
        sellAmount.toString(10),
        signature.v,
        signature.r,
        signature.s
    );
}

async function cancelOrder(maker, sellTokenAddress, sellTokenAmount, buyTokenAddress, buyTokenAmount, nonce, exchange, token) {
    const tokenContract = new ethers.Contract(token.address, token.abi, maker);
    const exchangeContract = new ethers.Contract(exchange.address, exchange.abi, maker);

    const decimals = await tokenContract.decimals();
    let tokenAmount;
    let etherAmount;
    let order;
    let signature;

    if (sellTokenAddress === etherAddress) {
        tokenAmount = ethers.utils.parseUnits(buyTokenAmount.toString(10), decimals);
        etherAmount = ethers.utils.parseEther(sellTokenAmount.toString(10));

        order = constructOrder(maker.address, sellTokenAddress, etherAmount, buyTokenAddress, tokenAmount, nonce, exchange.address);
        signature = getSignature(order, maker);

        await exchangeContract.functions.cancelOrder(
            [maker.address, sellTokenAddress, buyTokenAddress],
            [etherAmount, tokenAmount, nonce],
            signature.v,
            signature.r,
            signature.s
        );
    } else {
        tokenAmount = ethers.utils.parseUnits(sellTokenAmount.toString(10), decimals);
        etherAmount = ethers.utils.parseEther(buyTokenAmount.toString(10));

        order = constructOrder(maker.address, sellTokenAddress, tokenAmount, buyTokenAddress, etherAmount, nonce, exchange.address);
        signature = getSignature(order, maker);

        await exchangeContract.functions.cancelOrder(
            [maker.address, sellTokenAddress, buyTokenAddress],
            [tokenAmount, etherAmount, nonce],
            signature.v,
            signature.r,
            signature.s
        );
    }
    return getOrderHash(order);
}
