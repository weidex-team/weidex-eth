const actors = require("./config/actors");
const contract = require("./helper/contract");
const utils = require("./helper/utils");
const config = require("./config/config");
const assert = require("./helper/assert").assertString;
const { expectThrow } = require("./helper/exceptions");

const etherAddress = config.etherAddress;
const { alice, evelyn } = actors;

describe("trasfer", () => {
    let cfg;
    let weidexContract;
    let tokenAddress;

    beforeEach(async () => {
        cfg = await utils.init();
        weidexContract = cfg.exchange.instance;
        tokenAddress = cfg.token.address;

        await contract.transferTokens(cfg.token, alice.wallet, 5000);
        await contract.depositTokens(alice.wallet, cfg.token, cfg.exchange, 5000);
        await contract.depositEthers(cfg.exchange, alice.wallet, 1);
    });

    describe("transfer tokens", () => {
        it("should transfer tokens", async () => {
            await utils.updateExchangeBalancesBefore(weidexContract, tokenAddress);
            assert(evelyn.exchangeBalanceBefore, 0);

            weidexContract = weidexContract.connect(alice.wallet);
            await contract.exchangeTransfer(weidexContract, cfg.token.instance, evelyn.wallet.address, 2500, "tokens");

            await utils.updateExchangeBalancesAfter(weidexContract, tokenAddress);
            assert(evelyn.exchangeBalanceAfter, "2500000000000000000000");
        });

        it("should throw exception on transfer due to insufficient funds", async () => {
            await utils.updateExchangeBalancesBefore(weidexContract, tokenAddress);
            assert(evelyn.exchangeBalanceBefore, 0);

            weidexContract = weidexContract.connect(alice.wallet);
            await expectThrow(contract.exchangeTransfer(weidexContract, cfg.token.instance, evelyn.wallet.address, 5001, "tokens"), "revert");

            await utils.updateExchangeBalancesAfter(weidexContract, tokenAddress);
            assert(evelyn.exchangeBalanceAfter, evelyn.exchangeBalanceBefore);
        });
    });

    describe("transfer ethers", () => {
        it("should transfer ethers", async () => {
            await utils.updateExchangeBalancesBefore(weidexContract, etherAddress);
            assert(evelyn.exchangeBalanceBefore, 0);

            weidexContract = weidexContract.connect(alice.wallet);
            await contract.exchangeTransfer(weidexContract, { address: etherAddress }, evelyn.wallet.address, 0.5, "ethers");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(evelyn.exchangeBalanceAfter, "500000000000000000");
        });

        it("should throw exception on transfer due to insufficient funds", async () => {
            await utils.updateExchangeBalancesBefore(weidexContract, etherAddress);
            assert(evelyn.exchangeBalanceBefore, 0);

            weidexContract = weidexContract.connect(alice.wallet);
            await expectThrow(
                contract.exchangeTransfer(weidexContract, { address: etherAddress }, evelyn.wallet.address, 1.00001, "ethers"),
                "revert"
            );

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(evelyn.exchangeBalanceAfter, evelyn.exchangeBalanceBefore);
        });
    });
});
