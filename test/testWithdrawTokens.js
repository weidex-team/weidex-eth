const actors = require("./config/actors");
const contract = require("./helper/contract");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;

const { evelyn } = actors;

describe("withdraw tokens", () => {
    let cfg;

    before(async () => {
        cfg = await utils.init();
        await contract.transferTokens(cfg.token, evelyn.wallet, 100000);
        await contract.depositTokens(evelyn.wallet, cfg.token, cfg.exchange, 100000);
    });

    it("should withdraw tokens", async () => {
        await contract.withdrawTokens(cfg.exchange, cfg.token, evelyn.wallet, 60000);
    });

    it("should throw exception due to not enough funds", async () => {
        await contract.withdrawTokens(cfg.exchange, cfg.token, evelyn.wallet, 50000).catch(err => {
            assert(err.message, "VM Exception while processing transaction: revert");
        });
    });
});
