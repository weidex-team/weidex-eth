const actors = require("./config/actors");
const contract = require("./helper/contract");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;

const { alice, evelyn, george } = actors;

describe("deposit for functionality", () => {
    let cfg;

    before(async () => {
        cfg = await utils.init();
        await contract.transferTokens(cfg.token, alice.wallet, 100000);
    });

    describe("deposit ethers for", () => {
        it("should make a deposit", async () => {
            await contract.depositEthersFor(cfg.exchange, alice.wallet, 1, evelyn.wallet.address);
        });

        it("should make another deposit", async () => {
            await contract.depositEthersFor(cfg.exchange, alice.wallet, 0.5, evelyn.wallet.address);
        });
    });

    describe("deposit tokens for", () => {
        it("should make a deposit", async () => {
            await contract.depositTokensFor(alice.wallet, cfg.token, cfg.exchange, 50000, evelyn.wallet.address);

        });

        it("should make another deposit", async () => {
            await contract.depositTokensFor(alice.wallet, cfg.token, cfg.exchange, 25000, evelyn.wallet.address);
        });
    });
});
