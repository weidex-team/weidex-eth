const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;
const { expectThrow } = require("./helper/exceptions");
const { alice, evelyn } = require("./config/actors");

describe("should set new fee account", () => {
    let cfg;
    let weidexContract;

    before(async () => {
        cfg = await utils.init();
        weidexContract = cfg.exchange.instance;
    });

    it("should have correct fee account", async () => {
        await weidexContract.setFeeAccount(alice.wallet.address);

        const feeAccount = await weidexContract.feeAccount();

        assert(feeAccount, alice.wallet.address);
    });

    it("should throw exception if regular user tries to set the new fee account", async () => {
        weidexContract = weidexContract.connect(alice.wallet);

        const feeAccountBefore = await weidexContract.feeAccount();

        await expectThrow(weidexContract.setFeeAccount(evelyn.wallet.address), 'revert');

        const feeAccountAfter = await weidexContract.feeAccount();

        assert(feeAccountAfter, feeAccountBefore);
    });
});
