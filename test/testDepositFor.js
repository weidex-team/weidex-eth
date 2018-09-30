const actors = require("./config/actors");
const contract = require("./helper/contract");
const utils = require("./helper/utils");
const { expectThrow } = require("./helper/exceptions");

const { alice, evelyn } = actors;

describe("deposit for functionality", () => {
    let cfg;

    before(async () => {
        cfg = await utils.init();
        await contract.transferTokens(cfg.token, alice.wallet, 100000);
        await contract.transferTokens(cfg.oldToken, alice.wallet, 100000);
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

    describe("deposit old tokens for", () => {
        it("should make a deposit", async () => {
            await contract.depositOldTokensFor(alice.wallet, cfg.oldToken, cfg.exchange, 50000, evelyn.wallet.address);
        });

        it("should make another deposit", async () => {
            await contract.depositOldTokensFor(alice.wallet, cfg.oldToken, cfg.exchange, 25000, evelyn.wallet.address);
        });

        it("should throw exception due to not enough funds", async () => {
            await expectThrow(contract.depositOldTokensFor(alice.wallet, cfg.oldToken, cfg.exchange, 26000, evelyn.wallet.address), 'revert');
        });
    });
});
