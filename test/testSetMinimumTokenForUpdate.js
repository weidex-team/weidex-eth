const utils = require("./helper/utils");

describe("basic scenario of buy order", () => {
    let cfg;
    let weidexContract;

    before(async () => {
        cfg = await utils.init();
        weidexContract = cfg.exchange.instance;
    });

    describe("set minimum tokens amount for update", () => {
        it("should update the minimum amount for updating token price", async () => {
            await weidexContract.setMinimumTokenAmountForUpdate(2000);
        });
    });
});
