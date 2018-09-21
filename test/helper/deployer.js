const ethers = require("ethers");
const config = require("../config/config");
const provider = new ethers.providers.JsonRpcProvider(config.host, ethers.networks.mainnet);

const WeiDex = require("../../build/contracts/WeiDex");
const ERC20Mock = require("../../build/contracts/ERC20Mock");
const NewWeiDex = require("../../build/contracts/WeiDexMock");

module.exports = { deployWeiDexExchangeContract, deployNewWeidexExchangeContract, deployToken };

async function deployWeiDexExchangeContract(wallet, feeWallet) {
    const params = [feeWallet.address, config.feeRate, config.referralFeeRate];
    return await _deployExchange(WeiDex, wallet, params);
}

async function deployNewWeidexExchangeContract(wallet) {
    const params = [];
    return await _deployExchange(NewWeiDex, wallet, params);
}

async function deployToken(wallet, decimals) {
    return await _deployERC20(ERC20Mock, wallet, "TestToken", "TT", decimals);
}

async function _deployExchange(mock, wallet, params) {
    return await _getContract(mock, wallet, params);
}

async function _deployERC20(mock, wallet, name, symbol, decimal) {
    const params = [name, symbol, decimal];
    return await _getContract(mock, wallet, params);
}

async function _getContract(mock, wallet, params) {
    const contract = {
        bytecode: mock.bytecode,
        abi: mock.abi
    };
    const contractAddress = await _deploy(wallet, contract, undefined, params);
    return [contractAddress, contract.abi];
}

async function _deploy(wallet, contract, gasLimit = 0xfffffff, params) {
    const weidexDeployTransaction = ethers.Contract.getDeployTransaction(contract.bytecode, contract.abi, ...params);
    weidexDeployTransaction.gasLimit = gasLimit;
    const weidexDeployTransactionHash = (await wallet.sendTransaction(weidexDeployTransaction)).hash;
    return (await provider.getTransactionReceipt(weidexDeployTransactionHash)).contractAddress;
}
