const actors = require("./config/actors");
const contract = require("./helper/contract");
const config = require("./config/config");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;

const etherAddress = config.etherAddress;
const { feeAccount, alice, evelyn } = actors;

describe("sell order with decimal numbers", () => {
    let cfg;
    let weidexContract;
    let tokenContractAddress;

    before(async () => {
        cfg = await utils.init();
        weidexContract = cfg.exchange.instance;
        tokenContractAddress = cfg.token.address;
        await contract.transferTokens(cfg.token, alice.wallet, 100000);
        await contract.depositTokens(alice.wallet, cfg.token, cfg.exchange, 100000);
        await contract.depositEthers(cfg.exchange, evelyn.wallet, 10);
    });

    describe("take sell order", () => {
        it("should execute order without exception", async () => {
            await contract.takeSellOrder(
                alice.wallet,
                evelyn.wallet,
                cfg.token,
                "12345.678901234567890123",
                "1.234567890123456789",
                154,
                cfg.exchange,
                "0.00000000123456789"
            );
        });

        it("should have correct balances", async () => {
            await utils.updateExchangeBalancesAfter(weidexContract, tokenContractAddress);
            assert(alice.exchangeBalanceAfter, "99999999987654321100000");
            assert(evelyn.exchangeBalanceAfter, "12333333221100");
            assert(feeAccount.exchangeBalanceAfter, "12345678900");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(alice.exchangeBalanceAfter, "1233333323");
            assert(evelyn.exchangeBalanceAfter, "9999999998765432110");
            assert(feeAccount.exchangeBalanceAfter, "1234567");
        });

        it("should have correct balances", async () => {
            const dailyVolumeAfter = await weidexContract.dailyVolume();
            assert(dailyVolumeAfter, "1234567890");
        });
    });
});
