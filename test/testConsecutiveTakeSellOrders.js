const assert = require("./helper/assert").assertString;
const utils = require("./helper/utils");
const contract = require("./helper/contract");
const config = require("./config/config");

const etherAddress = config.etherAddress;
const { feeAccount, alice, evelyn } = utils.actors;

describe("consecutive sell orders", () => {
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

    describe("takes two sell orders subsequently", () => {
        it("should have correct balance after order execution", async () => {
            await contract.takeSellOrder(alice.wallet, evelyn.wallet, cfg.token, 10000, 1, 154, cfg.exchange, 1);

            await utils.updateExchangeBalancesAfter(weidexContract, tokenContractAddress);
            assert(alice.exchangeBalanceAfter, "90000000000000000000000");
            assert(evelyn.exchangeBalanceAfter, "9990000000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "10000000000000000000");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(alice.exchangeBalanceAfter, "999000000000000000");
            assert(evelyn.exchangeBalanceAfter, "9000000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "1000000000000000");

            const dailyVolumeAfter = await weidexContract.dailyVolume();
            assert(dailyVolumeAfter, "1000000000000000000");
        });

        it("should have correct balance after another order execution", async () => {
            await contract.takeSellOrder(alice.wallet, evelyn.wallet, cfg.token, 10000, 1, 235, cfg.exchange, 1);

            await utils.updateExchangeBalancesAfter(weidexContract, tokenContractAddress);
            assert(alice.exchangeBalanceAfter, "80000000000000000000000");
            assert(evelyn.exchangeBalanceAfter, "19980000000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "20000000000000000000");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(alice.exchangeBalanceAfter, "1998000000000000000");
            assert(evelyn.exchangeBalanceAfter, "8000000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "2000000000000000");

            const dailyVolumeAfter = await weidexContract.dailyVolume();
            assert(dailyVolumeAfter, "2000000000000000000");
        });
    });
});
