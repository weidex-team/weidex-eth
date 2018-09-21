const assert = require("./helper/assert").assertString;
const utils = require("./helper/utils");
const contract = require("./helper/contract");
const config = require("./config/config");

const etherAddress = config.etherAddress;
const { feeAccount, alice, evelyn } = utils.actors;

describe("cancel order", () => {
    let cfg;
    let weidexContract;
    let tokenAddress;

    before(async () => {
        cfg = await utils.init();
        weidexContract = cfg.exchange.instance;
        tokenAddress = cfg.token.address;

        await contract.transferTokens(cfg.token, alice.wallet, 100000);
        await contract.depositTokens(alice.wallet, cfg.token, cfg.exchange, 100000);
        await contract.depositEthers(cfg.exchange, evelyn.wallet, 10);
    });

    describe("cancel sell order", () => {
        let orderHash;

        it("should cancel the order without exception", async () => {
            orderHash = await contract.cancelOrder(alice.wallet, cfg.token.address, 10000, etherAddress, 1, 154, cfg.exchange, cfg.token);
        });

        it("should have correct balance", async () => {
            await utils.updateExchangeBalancesAfter(weidexContract, tokenAddress);
            assert(alice.exchangeBalanceAfter, "100000000000000000000000");
            assert(evelyn.exchangeBalanceAfter, "0");
            assert(feeAccount.exchangeBalanceAfter, "0");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(alice.exchangeBalanceAfter, "0");
            assert(evelyn.exchangeBalanceAfter, "10000000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "0");

            const dailyVolumeAfter = await weidexContract.dailyVolume();
            assert(dailyVolumeAfter, "0");
        });

        it("should have filled order amount", async () => {
            const filledAmounts = await weidexContract.filledAmounts(orderHash);
            assert(filledAmounts, "1000000000000000000");
        });
    });

    describe("cancel buy order", () => {
        let orderHash;
        it("should cancel the order without exception", async () => {
            orderHash = await contract.cancelOrder(alice.wallet, etherAddress, 1, cfg.token.address, 10000, 154, cfg.exchange, cfg.token);
        });

        it("should have correct balance", async () => {
            await utils.updateExchangeBalancesAfter(weidexContract, tokenAddress);
            assert(alice.exchangeBalanceAfter, "100000000000000000000000");
            assert(evelyn.exchangeBalanceAfter, "0");
            assert(feeAccount.exchangeBalanceAfter, "0");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(alice.exchangeBalanceAfter, "0");
            assert(evelyn.exchangeBalanceAfter, "10000000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "0");

            const dailyVolumeAfter = await weidexContract.dailyVolume();
            assert(dailyVolumeAfter, "0");
        });

        it("should have filled order amount", async () => {
            const filledAmounts = await weidexContract.filledAmounts(orderHash);
            assert(filledAmounts, "10000000000000000000000");
        });
    });
});
