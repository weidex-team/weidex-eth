const actors = require("./config/actors");
const contract = require("./helper/contract");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;
const { expectThrow } = require("./helper/exceptions");

const { alice, evelyn, george } = actors;

describe("deposit old tokens", () => {
    let cfg;

    before(async () => {
        cfg = await utils.init();
        await contract.transferTokens(cfg.oldToken, evelyn.wallet, 100000);
        await contract.transferTokens(cfg.oldToken, alice.wallet, 100000);
    });

    describe("without referral", () => {
        it("should make a deposit", async () => {
            await contract.depositOldTokens(evelyn.wallet, cfg.oldToken, cfg.exchange, 50000);
        });

        it("should make another deposits", async () => {
            await contract.depositOldTokens(evelyn.wallet, cfg.oldToken, cfg.exchange, 50000);
        });

        it("should throw exception due to not enough funds", async () => {
            await expectThrow(contract.depositOldTokens(evelyn.wallet, cfg.oldToken, cfg.exchange, 50000), 'revert');
        });
    });

    describe("with referral", () => {
        it("should make a deposit", async () => {
            await contract.depositOldTokensWithReferral(alice.wallet, cfg.oldToken, cfg.exchange, 15000, george.wallet);
        });

        it("should throw exception due to not enough funds", async () => {
            await expectThrow(contract.depositOldTokensWithReferral(alice.wallet, cfg.oldToken, cfg.exchange, 150000, george.wallet), 'revert');
        });

        it("should throw exception when tries to reassign the referrer", async () => {
            await expectThrow(contract.depositOldTokensWithReferral(alice.wallet, cfg.oldToken, cfg.exchange, 15000, george.wallet), 'revert');
        });
    });
});
