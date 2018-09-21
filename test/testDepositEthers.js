const actors = require("./config/actors");
const contract = require("./helper/contract");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;

const { alice, evelyn, george } = actors;

describe("deposit ethers", () => {
    let cfg;

    before(async () => {
        cfg = await utils.init();
    });

    describe("without referral", () => {
        it("should make a deposit", async () => {
            await contract.depositEthers(cfg.exchange, alice.wallet, 1);
        });

        it("should make another deposit", async () => {
            await contract.depositEthers(cfg.exchange, alice.wallet, 0.5);
        });
    });

    describe("with referral", () => {
        it("should make a deposit", async () => {
            await contract.depositEthersWithReferral(cfg.exchange, evelyn.wallet, 1, george.wallet);
        });

        it("should throw exception when tries to reassign the referrer", async () => {
            await contract
                .depositEthersWithReferral(cfg.exchange, evelyn.wallet, 0.5, george.wallet)
                .then(() => {
                    throw new Error("Exception not thrown");
                })
                .catch(err => {
                    assert(err.message, "VM Exception while processing transaction: revert");
                });
        });
    });
});
