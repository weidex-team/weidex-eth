const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;
const { expectThrow } = require("./helper/exceptions");
const { alice } = require("./config/actors");

describe("should set fee", () => {
    let cfg;
    let weidexContract;

    before(async () => {
        cfg = await utils.init();
        weidexContract = cfg.exchange.instance;
    });

    it("should have correct fee rate", async () => {
        await weidexContract.setFee(200);

        const feeRateAfter = await weidexContract.feeRate();

        assert(feeRateAfter, 200);
    });


    it("should throw exception if regular user tries to set the fee", async () => {
        weidexContract = weidexContract.connect(alice.wallet);

        const feeRateBefore = await weidexContract.feeRate();

        await expectThrow(weidexContract.setFee(200), 'revert');

        const feeRateAfter = await weidexContract.feeRate();

        assert(feeRateAfter, feeRateBefore);
    });
});
