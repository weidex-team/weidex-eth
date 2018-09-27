const actors = require("./config/actors");
const contract = require("./helper/contract");
const config = require("./config/config");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;
const { expectThrow } = require('./helper/exceptions')

const etherAddress = config.etherAddress;
const { exchangeOwner, feeAccount, alice, evelyn, george } = actors;

describe("multiple order fullfilment", () => {
    let cfg;
    let tokenContractAddress;
    let weidexContract;

    let takerSellAmount;
    let orderAddresses;
    let orderValues;
    let takerSellAmounts;
    let v;
    let r;
    let s;

    // takeSellOrder method id
    // i.e. the first 4 bytes of the hash of the function prototype
    const methodId = "0x4ac9f881";

    before(async () => {
        cfg = await utils.init();
        tokenContractAddress = cfg.token.address;
        weidexContractAddress = cfg.exchange.address;
        weidexContract = cfg.exchange.instance;

        await contract.transferTokens(cfg.token, alice.wallet, 100000);
        await contract.transferTokens(cfg.token, george.wallet, 100000);
        await contract.depositTokens(alice.wallet, cfg.token, cfg.exchange, 100000);
        await contract.depositTokens(george.wallet, cfg.token, cfg.exchange, 100000);
        await contract.depositEthers(cfg.exchange, evelyn.wallet, 10);

        weidexContract = weidexContract.connect(exchangeOwner.wallet);
        await weidexContract.functions.allowOrRestrictMethod(methodId, true);

        const firstOrder = contract.createOrder(
            alice.wallet,
            tokenContractAddress,
            "10000000000000000000000",
            etherAddress,
            "1000000000000000000",
            0,
            cfg.exchange
        );

        const secondOrder = contract.createOrder(
            george.wallet,
            tokenContractAddress,
            "10000000000000000000000",
            etherAddress,
            "1000000000000000000",
            1,
            cfg.exchange
        );

        takerSellAmount = "1000000000000000000";
        orderAddresses = [firstOrder.addresses, secondOrder.addresses];
        orderValues = [firstOrder.values, secondOrder.values];
        takerSellAmounts = [takerSellAmount, takerSellAmount];
        v = [firstOrder.signature.v, secondOrder.signature.v];
        r = [firstOrder.signature.r, secondOrder.signature.r];
        s = [firstOrder.signature.s, secondOrder.signature.s];
    });

    describe("take take all possible sell orders", () => {
        it("should fail due to invalid method id", async() => {
            weidexContract = weidexContract.connect(evelyn.wallet);
            await expectThrow(weidexContract.functions.takeAllPossible(
                orderAddresses,
                orderValues,
                takerSellAmounts,
                v,
                r,
                s,
                "0x12345678"),
                'revert'
            );
        });

        it("should execute multiple sell order without exception", async () => {
            weidexContract = weidexContract.connect(evelyn.wallet);
            await weidexContract.functions.takeAllPossible(
                orderAddresses,
                orderValues,
                takerSellAmounts,
                v,
                r,
                s,
                methodId
            );
        });

        it("should have correct balances", async () => {
            await utils.updateExchangeBalancesAfter(weidexContract, tokenContractAddress);
            assert(alice.exchangeBalanceAfter, "90000000000000000000000");
            assert(evelyn.exchangeBalanceAfter, "19980000000000000000000");
            assert(george.exchangeBalanceAfter, "90000000000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "20000000000000000000");

            await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
            assert(alice.exchangeBalanceAfter, "999000000000000000");
            assert(evelyn.exchangeBalanceAfter, "8000000000000000000");
            assert(george.exchangeBalanceAfter, "999000000000000000");
            assert(feeAccount.exchangeBalanceAfter, "2000000000000000");
        });

        it("should have correct volume", async () => {
            const dailyVolumeAfter = await weidexContract.dailyVolume();
            assert(dailyVolumeAfter, "2000000000000000000");
        });
    });
});
