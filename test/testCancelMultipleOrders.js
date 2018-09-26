const assert = require("./helper/assert").assertString;
const utils = require("./helper/utils");
const contract = require("./helper/contract");
const config = require("./config/config");

const etherAddress = config.etherAddress;
const { alice } = utils.actors;

describe("cancel multiple orders", () => {
    let cfg;
    let weidexContract;
    let tokenAddress;

    before(async () => {
        cfg = await utils.init();
        weidexContract = cfg.exchange.instance;
        tokenAddress = cfg.token.address;

        await contract.transferTokens(cfg.token, alice.wallet, 100000);
        await contract.depositTokens(alice.wallet, cfg.token, cfg.exchange, 100000);
    });

    let firstOrder;
    let secondOrder;

    it("should create two orders", async () => {
        firstOrder = contract.createOrder(alice.wallet, etherAddress, "1000000000000000000", tokenAddress, "1000000000000000000000", 0, cfg.exchange);
        secondOrder = contract.createOrder(alice.wallet, etherAddress, "2000000000000000000", tokenAddress, "2000000000000000000000", 1, cfg.exchange);
    });

    it("should have zero for filled amount", async () => {
        let filledAmounts = await weidexContract.filledAmounts(firstOrder.orderHash);
        assert(filledAmounts, "0");

        filledAmounts = await weidexContract.filledAmounts(secondOrder.orderHash);
        assert(filledAmounts, "0");
    });

    it("should cancel multiple orders", async () => {

        weidexContract = weidexContract.connect(alice.wallet)
        await weidexContract.cancelMultipleOrders(
            [firstOrder.addresses, secondOrder.addresses],
            [firstOrder.values, secondOrder.values],
            [firstOrder.signature.v, secondOrder.signature.v],
            [firstOrder.signature.r, secondOrder.signature.r],
            [firstOrder.signature.s, secondOrder.signature.s]
        );
    });

    it("should have full filled amount", async () => {
        let filledAmounts = await weidexContract.filledAmounts(firstOrder.orderHash);
        assert(filledAmounts, "1000000000000000000000");

        filledAmounts = await weidexContract.filledAmounts(secondOrder.orderHash);
        assert(filledAmounts, "2000000000000000000000");
    });
});
