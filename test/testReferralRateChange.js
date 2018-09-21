const assert = require("./helper/assert").assertString;
const utils = require("./helper/utils");
const config = require("./config/config");

const { evelyn } = utils.actors;

describe("referral rate setter", () => {
    let cfg;
    let weidexContract;

    beforeEach(async () => {
        cfg = await utils.init();
        weidexContract = cfg.exchange.instance;
    });

    describe("set referral rate", () => {
        it("should change referral rate by the owner", async () => {
            const oldReferralRate = await weidexContract.referralFeeRate();
            assert(oldReferralRate, config.referralFeeRate);
            await weidexContract.setReferralFee(10);
            const newReferralRate = await weidexContract.referralFeeRate();
            assert(newReferralRate, 10);
        });

        it("should throw exception if rate is changed by user", async () => {
            weidexContract = weidexContract.connect(evelyn.wallet);
            const oldReferralRate = await weidexContract.referralFeeRate();
            assert(oldReferralRate, config.referralFeeRate);
            await weidexContract
                .setReferralFee(10)
                .then(() => {
                    throw new Error("Exception not thrown");
                })
                .catch(err => {
                    assert(err.message, "VM Exception while processing transaction: revert");
                });
            const newReferralRate = await weidexContract.referralFeeRate();
            assert(newReferralRate, oldReferralRate);
        });
    });
});
