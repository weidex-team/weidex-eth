const actors = require("./config/actors");
const contract = require("./helper/contract");
const config = require("./config/config");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;

const etherAddress = config.etherAddress;
const { feeAccount, alice, evelyn } = actors;

describe("basic scenario of buy order", () => {
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

    describe("take buy order", () => {
        it("should execute buyt oken order without exception", async () => {
            await contract.takeBuyTokenOrder(evelyn.wallet, alice.wallet, cfg.weidexToken, 5000, 1, 154, cfg.exchange, 5000);
        });

        it("should have correct balances", async () => {
            await utils.updateExchangeBalancesAfter(weidexContract, weidexTokenAddress);
            assert(alice.exchangeBalanceAfter, "5000000000000000000000");
            assert(evelyn.exchangeBalanceAfter, "5000000000000000000000");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(alice.exchangeBalanceAfter, "1000000000000000000");
            assert(evelyn.exchangeBalanceAfter, "9000000000000000000");
        });

        it("should have zero balance for fee account", async() => {
            await utils.updateExchangeBalancesAfter(weidexContract, weidexTokenAddress);
            assert(feeAccount.exchangeBalanceAfter, "0");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(feeAccount.exchangeBalanceAfter, "0");
        });

        it("should have correct volume", async () => {
            const dailyVolumeAfter = await weidexContract.dailyVolume();
            assert(dailyVolumeAfter, "1000000000000000000");
        });
    });
});
