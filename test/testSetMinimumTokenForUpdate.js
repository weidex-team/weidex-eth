const utils = require("./helper/utils");

describe("set minimum tokens amount for update", () => {
    let cfg;
    let weidexContract;

    before(async () => {
        cfg = await utils.init();
        weidexContract = cfg.exchange.instance;
    });

    it("should update the minimum amount for updating token price", async () => {
        await weidexContract.setMinimumTokenAmountForUpdate(2000);
    });
});
