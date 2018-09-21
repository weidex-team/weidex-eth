const actors = require("./config/actors");
const contract = require("./helper/contract");
const config = require("./config/config");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;

const etherAddress = config.etherAddress;
const { feeAccount, alice, evelyn } = actors;

describe("taker and maker pays with WDX", () => {
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
        await contract.depositTokens(alice.wallet, cfg.token, cfg.exchange, 100000);

        await contract.transferTokens(cfg.weidexToken, alice.wallet, 10000);
        await contract.depositTokens(alice.wallet, cfg.weidexToken, cfg.exchange, 10000);

        await contract.transferTokens(cfg.weidexToken, evelyn.wallet, 5000);
        await contract.depositTokens(evelyn.wallet, cfg.weidexToken, cfg.exchange, 5000);

        await contract.depositEthers(cfg.exchange, evelyn.wallet, 10);
    });

    describe("take sell order", () => {
        it("should execute sell order without exception", async () => {
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
            assert(feeAccount.exchangeBalanceAfter, "500000000000000000");
        });

        it("should have correct volume", async () => {
            const dailyVolumeAfter = await weidexContract.dailyVolume();
            assert(dailyVolumeAfter.toString(), "1000000000000000000");
        });
    });
});
