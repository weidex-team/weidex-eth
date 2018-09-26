const actors = require("./config/actors");
const contract = require("./helper/contract");
const config = require("./config/config");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;
const { timeTravel, duration } = require("./helper/time");

const etherAddress = config.etherAddress;
const { feeAccount, alice, evelyn } = actors;

describe("volume updater", () => {
    let cfg;
    let weidexContract;
    let tokenContractAddress;

    before(async () => {
        cfg = await utils.init();
        weidexContract = cfg.exchange.instance;
        tokenContractAddress = cfg.token.address;
        await contract.transferTokens(cfg.token, alice.wallet, 100000);
        await contract.depositEthers(cfg.exchange, evelyn.wallet, 10);
        await contract.depositTokens(alice.wallet, cfg.token, cfg.exchange, 100000);
    });

    it("should take regular fee", async () => {
        await contract.takeSellOrder(alice.wallet, evelyn.wallet, cfg.token, 10000, 1, 154, cfg.exchange, 1);

        await utils.updateExchangeBalancesAfter(weidexContract, tokenContractAddress);
        assert(alice.exchangeBalanceAfter.toString(), "90000000000000000000000");
        assert(evelyn.exchangeBalanceAfter.toString(), "9990000000000000000000");
        assert(feeAccount.exchangeBalanceAfter.toString(), "10000000000000000000");

        await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
        assert(alice.exchangeBalanceAfter.toString(), "999000000000000000");
        assert(evelyn.exchangeBalanceAfter.toString(), "9000000000000000000");
        assert(feeAccount.exchangeBalanceAfter.toString(), "1000000000000000");

        const dailyVolumeAfter = await weidexContract.dailyVolume();
        assert(dailyVolumeAfter.toString(), "1000000000000000000");
    });

    it("should set volume cap to 0.5 ETH", async () => {
        const volumeBeforeUpdate = await weidexContract.dailyVolumeCap();
        assert(volumeBeforeUpdate, "1000000000000000000000");

        await weidexContract.setDailyVolumeCap("500000000000000000");

        const volumeAfterUpdate = await weidexContract.dailyVolumeCap();
        assert(volumeAfterUpdate, "500000000000000000");
    });

    it("should take no fee after volume is reached", async () => {
        await contract.takeSellOrder(alice.wallet, evelyn.wallet, cfg.token, 10000, 1, 155, cfg.exchange, 1);
        await utils.updateExchangeBalancesAfter(weidexContract, tokenContractAddress);
        assert(alice.exchangeBalanceAfter.toString(), "80000000000000000000000");
        assert(evelyn.exchangeBalanceAfter.toString(), "19990000000000000000000");
        assert(feeAccount.exchangeBalanceAfter.toString(), "10000000000000000000");

        await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
        assert(alice.exchangeBalanceAfter.toString(), "1999000000000000000");
        assert(evelyn.exchangeBalanceAfter.toString(), "8000000000000000000");
        assert(feeAccount.exchangeBalanceAfter.toString(), "1000000000000000");

        const dailyVolumeAfter = await weidexContract.dailyVolume();
        assert(dailyVolumeAfter.toString(), "2000000000000000000");
    });

    it("should take fee after 1 day and volume not reached", async () => {
        await timeTravel(duration.days(1));
        await contract.takeSellOrder(alice.wallet, evelyn.wallet, cfg.token, 10000, 0.1, 156, cfg.exchange, 0.1);

        await utils.updateExchangeBalancesAfter(weidexContract, tokenContractAddress);
        assert(alice.exchangeBalanceAfter.toString(), "70000000000000000000000");
        assert(evelyn.exchangeBalanceAfter.toString(), "29980000000000000000000");
        assert(feeAccount.exchangeBalanceAfter.toString(), "20000000000000000000");

        await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
        assert(alice.exchangeBalanceAfter.toString(), "2098900000000000000");
        assert(evelyn.exchangeBalanceAfter.toString(), "7900000000000000000");
        assert(feeAccount.exchangeBalanceAfter.toString(), "1100000000000000");

        const dailyVolumeAfter = await weidexContract.dailyVolume();
        assert(dailyVolumeAfter.toString(), "100000000000000000");
    });
});
