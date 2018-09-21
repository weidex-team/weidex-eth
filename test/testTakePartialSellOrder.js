const actors = require("./config/actors");
const contract = require("./helper/contract");
const config = require("./config/config");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;

const etherAddress = config.etherAddress;
const { feeAccount, alice, evelyn, george } = actors;

describe("partial fill", () => {
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
        await contract.depositEthers(cfg.exchange, george.wallet, 10);
    });

    describe("take first partial sell orders", () => {
        it("should execute sell order without exception", async () => {
            await contract.takeSellOrder(alice.wallet, evelyn.wallet, cfg.token, 10000, 1, 154, cfg.exchange, 0.3);
        });

        it("should have correct balances", async () => {
            await utils.updateExchangeBalancesAfter(weidexContract, tokenContractAddress);
            assert(alice.exchangeBalanceAfter, "97000000000000000000000");
            assert(evelyn.exchangeBalanceAfter, "2997000000000000000000");
            assert(george.exchangeBalanceAfter, "0");
            assert(feeAccount.exchangeBalanceAfter, "3000000000000000000");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(alice.exchangeBalanceAfter, "299700000000000000");
            assert(evelyn.exchangeBalanceAfter, "9700000000000000000");
            assert(george.exchangeBalanceAfter, "10000000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "300000000000000");
        });

        it("should have correct volume", async () => {
            const dailyVolumeAfter = await weidexContract.dailyVolume();
            assert(dailyVolumeAfter, "300000000000000000");
        });
    });

    describe("take second partial sell orders", () => {
        it("should execute sell order without exception", async () => {
            await contract.takeSellOrder(alice.wallet, george.wallet, cfg.token, 10000, 1, 154, cfg.exchange, 0.5);
        });

        it("should have correct balances", async () => {
            await utils.updateExchangeBalancesAfter(weidexContract, tokenContractAddress);
            assert(alice.exchangeBalanceAfter, "92000000000000000000000");
            assert(evelyn.exchangeBalanceAfter, "2997000000000000000000");
            assert(george.exchangeBalanceAfter, "4995000000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "8000000000000000000");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(alice.exchangeBalanceAfter, "799200000000000000");
            assert(evelyn.exchangeBalanceAfter, "9700000000000000000");
            assert(george.exchangeBalanceAfter, "9500000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "800000000000000");
        });

        it("should have correct volume", async () => {
            const dailyVolumeAfter = await weidexContract.dailyVolume();
            assert(dailyVolumeAfter, "800000000000000000");
        });
    });

    describe("take third partial sell orders exceeding the order amount", () => {
        it("should throw exception", async () => {
            await contract
                .takeSellOrder(alice.wallet, george.wallet, cfg.token, 10000, 1, 154, cfg.exchange, 0.5)
                .then(() => {
                    throw new Error("Exception not thrown");
                })
                .catch(err => {
                    assert(err.message, "VM Exception while processing transaction: revert");
                });
        });

        it("should have correct balances", async () => {
            await utils.updateExchangeBalancesAfter(weidexContract, tokenContractAddress);
            assert(alice.exchangeBalanceAfter, "92000000000000000000000");
            assert(evelyn.exchangeBalanceAfter, "2997000000000000000000");
            assert(george.exchangeBalanceAfter, "4995000000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "8000000000000000000");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(alice.exchangeBalanceAfter, "799200000000000000");
            assert(evelyn.exchangeBalanceAfter, "9700000000000000000");
            assert(george.exchangeBalanceAfter, "9500000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "800000000000000");
        });

        it("should have correct volume", async () => {
            const dailyVolumeAfter = await weidexContract.dailyVolume();
            assert(dailyVolumeAfter, "800000000000000000");
        });
    });
});
