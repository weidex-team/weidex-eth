const actors = require("./config/actors");
const contract = require("./helper/contract");
const config = require("./config/config");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;

const etherAddress = config.etherAddress;
const { feeAccount, alice, evelyn } = actors;

describe("sells WDX tokens", () => {
    let cfg;
    let weidexContract;
    let weidexTokenAddress;

    before(async () => {
        cfg = await utils.init();
        weidexContract = cfg.exchange.instance;
        weidexTokenAddress = cfg.weidexToken.address;
        await contract.transferTokens(cfg.weidexToken, alice.wallet, 100000);
        await contract.depositTokens(alice.wallet, cfg.weidexToken, cfg.exchange, 10000);
        await contract.depositEthers(cfg.exchange, evelyn.wallet, 10);
    });

    describe("take sell token order", () => {
        it("should execute sell order without exception", async () => {
            await contract.takeSellTokenOrder(alice.wallet, evelyn.wallet, cfg.weidexToken, 1000, 1, 154, cfg.exchange, 1);

            await utils.updateExchangeBalancesAfter(weidexContract, weidexTokenAddress);
            assert(alice.exchangeBalanceAfter.toString(), "9000000000000000000000");
            assert(evelyn.exchangeBalanceAfter.toString(), "1000000000000000000000");
            assert(feeAccount.exchangeBalanceAfter.toString(), "0");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(alice.exchangeBalanceAfter.toString(), "1000000000000000000");
            assert(evelyn.exchangeBalanceAfter.toString(), "9000000000000000000");
            assert(feeAccount.exchangeBalanceAfter.toString(), "0");

            const dailyVolumeAfter = await weidexContract.dailyVolume();

            assert(dailyVolumeAfter.toString(), "1000000000000000000");
        });

        it("should have correct balances", async () => {
            await utils.updateExchangeBalancesAfter(weidexContract, weidexTokenAddress);
            assert(alice.exchangeBalanceAfter.toString(), "9000000000000000000000");
            assert(evelyn.exchangeBalanceAfter.toString(), "1000000000000000000000");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(alice.exchangeBalanceAfter.toString(), "1000000000000000000");
            assert(evelyn.exchangeBalanceAfter.toString(), "9000000000000000000");
        });

        it("should have no fee taken", async () => {
            await utils.updateExchangeBalancesAfter(weidexContract, weidexTokenAddress);
            assert(feeAccount.exchangeBalanceAfter.toString(), "0");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(feeAccount.exchangeBalanceAfter.toString(), "0");
        });

        it("should have correct volume update", async () => {
            const dailyVolumeAfter = await weidexContract.dailyVolume();
            assert(dailyVolumeAfter.toString(), "1000000000000000000");
        });
    });
});
