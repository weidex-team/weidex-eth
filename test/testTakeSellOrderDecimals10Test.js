const actors = require("./config/actors");
const contract = require("./helper/contract");
const config = require("./config/config");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;

const etherAddress = config.etherAddress;
const { feeAccount, alice, evelyn } = actors;

describe("trade token with 10 decimals", () => {
    let cfg;
    let weidexContract;
    let tokenContractAddress;

    before(async () => {
        cfg = await utils.init();
        weidexContract = cfg.exchange.instance;
        tokenContractAddress = cfg.token10Decimals.address;

        await contract.transferTokens(cfg.token10Decimals, alice.wallet, 100000);
        await contract.depositTokens(alice.wallet, cfg.token10Decimals, cfg.exchange, 100000);
        await contract.depositEthers(cfg.exchange, evelyn.wallet, 10);
    });

    describe("take sell order", () => {
        it("should execute sell order without exception", async () => {
            await contract.takeSellOrder(alice.wallet, evelyn.wallet, cfg.token10Decimals, 10000, 1, 154, cfg.exchange, 1);
        });

        it("should have correct balances", async () => {
            await utils.updateExchangeBalancesAfter(weidexContract, tokenContractAddress);
            assert(alice.exchangeBalanceAfter, "900000000000000");
            assert(evelyn.exchangeBalanceAfter, "99900000000000");
            assert(feeAccount.exchangeBalanceAfter, "100000000000");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(alice.exchangeBalanceAfter, "999000000000000000");
            assert(evelyn.exchangeBalanceAfter, "9000000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "1000000000000000");
        });

        it("should have correct volume", async () => {
            const dailyVolumeAfter = await weidexContract.dailyVolume();
            assert(dailyVolumeAfter, "1000000000000000000");
        });
    });
});
