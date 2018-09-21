const actors = require("./config/actors");
const contract = require("./helper/contract");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;

const { alice, evelyn, george } = actors;

describe("deposit tokens", () => {
    let cfg;

    before(async () => {
        cfg = await utils.init();
        await contract.transferTokens(cfg.token, evelyn.wallet, 100000);
        await contract.transferTokens(cfg.token, alice.wallet, 100000);
    });

    describe("without referral", () => {
        it("should make a deposit", async () => {
            await contract.depositTokens(evelyn.wallet, cfg.token, cfg.exchange, 50000);
        });

        it("should make another deposits", async () => {
            await contract.depositTokens(evelyn.wallet, cfg.token, cfg.exchange, 50000);
        });

        it("should throw exception due to not enough funds", async () => {
            await contract
                .depositTokens(evelyn.wallet, cfg.token, cfg.exchange, 50000)
                .then(() => {
                    throw new Error("Exception not thrown");
                })
                .catch(err => {
                    assert(err.message, "VM Exception while processing transaction: revert");
                });
        });
    });

    describe("with referral", () => {
        it("should make a deposit", async () => {
            await contract.depositTokensWithReferral(alice.wallet, cfg.token, cfg.exchange, 15000, george.wallet);
        });

        it("should throw exception when tries to reassign the referrer", async () => {
            await contract
                .depositTokensWithReferral(alice.wallet, cfg.token, cfg.exchange, 15000, george.wallet)
                .then(() => {
                    throw new Error("Exception not thrown");
                })
                .catch(err => {
                    assert(err.message, "VM Exception while processing transaction: revert");
                });
        });
    });
});
