const actors = require("./config/actors");
const contract = require("./helper/contract");
const utils = require("./helper/utils");
const { expectThrow } = require("./helper/exceptions");


const { evelyn } = actors;

describe("withdraw tokens", () => {
    let cfg;

    before(async () => {
        cfg = await utils.init();
        await contract.transferTokens(cfg.oldToken, evelyn.wallet, 100000);
        await contract.depositOldTokens(evelyn.wallet, cfg.oldToken, cfg.exchange, 100000);
    });

    it("should withdraw tokens", async () => {
        await contract.withdrawOldTokens(cfg.exchange, cfg.oldToken, evelyn.wallet, 60000);
    });

    it("should throw exception due to not enough funds", async () => {
        await expectThrow(contract.withdrawOldTokens(cfg.exchange, cfg.oldToken, evelyn.wallet, 50000), 'revert');
    });
});
