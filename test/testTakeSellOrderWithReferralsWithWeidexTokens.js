const actors = require("./config/actors");
const contract = require("./helper/contract");
const config = require("./config/config");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;

const etherAddress = config.etherAddress;
const { feeAccount, alice, evelyn, george, stan } = actors;

describe("maker and taker has referrers, both pays the fee in WDX", () => {
    let cfg;
    let weidexContract;
    let tokenContractAddress;
    let weidexTokenAddress;

    before(async () => {
        cfg = await utils.init();
        weidexContract = cfg.exchange.instance;
        tokenContractAddress = cfg.token.address;
        weidexTokenAddress = cfg.weidexToken.address;

        await contract.transferTokens(cfg.token, alice.wallet, 100000);
        await contract.depositTokensWithReferral(alice.wallet, cfg.token, cfg.exchange, 100000, george.wallet);

        await contract.transferTokens(cfg.weidexToken, alice.wallet, 10000);
        await contract.depositTokens(alice.wallet, cfg.weidexToken, cfg.exchange, 10000);

        await contract.transferTokens(cfg.weidexToken, evelyn.wallet, 5000);
        await contract.depositTokens(evelyn.wallet, cfg.weidexToken, cfg.exchange, 5000);

        await contract.depositEthersWithReferral(cfg.exchange, evelyn.wallet, 10, stan.wallet);
    });

    describe("take sell order", () => {
        it("should execute order without exception", async () => {
            await contract.takeSellOrder(alice.wallet, evelyn.wallet, cfg.token, 10000, 1, 154, cfg.exchange, 1);
        });

        it("should have correct balances", async () => {
            await utils.updateExchangeBalancesAfter(weidexContract, tokenContractAddress);
            assert(alice.exchangeBalanceAfter, "90000000000000000000000");
            assert(evelyn.exchangeBalanceAfter, "10000000000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "0");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(alice.exchangeBalanceAfter, "1000000000000000000");
            assert(evelyn.exchangeBalanceAfter, "9000000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "0");

            await utils.updateExchangeBalancesAfter(weidexContract, weidexTokenAddress);
            assert(alice.exchangeBalanceAfter, "9999750000000000000000");
            assert(evelyn.exchangeBalanceAfter, "4999750000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "400000000000000000");
        });

        it("should have correct balances for the referrer", async () => {
            await utils.updateExchangeBalancesAfter(weidexContract, weidexTokenAddress);
            assert(george.exchangeBalanceAfter, "50000000000000000");
            assert(stan.exchangeBalanceAfter, "50000000000000000");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(george.exchangeBalanceAfter, "0");
            assert(stan.exchangeBalanceAfter, "0");

            await utils.updateExchangeBalancesAfter(weidexContract, tokenContractAddress);
            assert(george.exchangeBalanceAfter, "0");
            assert(stan.exchangeBalanceAfter, "0");
        });

        it("should have correct volume", async () => {
            const dailyVolumeAfter = await weidexContract.dailyVolume();
            assert(dailyVolumeAfter.toString(), "1000000000000000000");
        });
    });
});
