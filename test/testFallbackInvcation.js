const utils = require("./helper/utils");
const {expectThrow} = require('./helper/exceptions')
const { alice } = utils.actors;

describe("fallback function", () => {
    let cfg;

    before(async () => {
        cfg = await utils.init();
    });

    it("should throw exception when send ETH to the contract", async () => {
        var tx = { to: cfg.exchange.address, value: 1000000000000000000 };
        await expectThrow(alice.wallet.sendTransaction(tx), 'revert');
    });
});
