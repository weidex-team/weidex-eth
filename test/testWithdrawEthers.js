const actors = require("./config/actors");
const contract = require("./helper/contract");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;

const { alice } = actors;

describe("withdraw ethers", () => {
    let cfg;

    before(async () => {
        cfg = await utils.init();
        await contract.depositEthers(cfg.exchange, alice.wallet, 1);
    });

    it("should withdraw ethers", async () => {
        await contract.withdrawEthers(cfg.exchange, alice.wallet, 0.5);
    });

    it("should throw exception due to not enough funds", async () => {
        await contract.withdrawEthers(cfg.exchange, alice.wallet, 0.6).catch(err => {
            assert(err.message, "VM Exception while processing transaction: revert");
        });
    });

    it("should withdraw everything left", async () => {
        await contract.withdrawEthers(cfg.exchange, alice.wallet, 0.5);
    });
});
