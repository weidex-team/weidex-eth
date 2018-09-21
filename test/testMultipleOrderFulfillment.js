const actors = require("./config/actors");
const contract = require("./helper/contract");
const config = require("./config/config");
const utils = require("./helper/utils");
const assert = require("./helper/assert").assertString;

const etherAddress = config.etherAddress;
const { exchangeOwner, feeAccount, alice, evelyn, george } = actors;

describe("multiple order fullfilment", () => {
    let cfg;
    let tokenContractAddress;
    let weidexContractAddress;
    let weidexContract;

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
    });

    describe("take multiple sell order", () => {
        it("should execute multiple sell order without exception", async () => {
            // Order addresses
            const aliceMaker = alice.wallet.address;
            const georgeMaker = george.wallet.address;
            const tokenAddress = tokenContractAddress;

            // Order values
            const etherAmount = "1000000000000000000";
            const tokensAmount = "10000000000000000000000";
            const aliceNonce = "154";
            const georgeNonce = "244";
            const takerSellAmount = "1000000000000000000";

            const aliceOrder = contract.constructOrder(
                alice.wallet.address,
                tokenContractAddress,
                tokensAmount,
                etherAddress,
                etherAmount,
                aliceNonce,
                weidexContractAddress
            );

            const aliceSignature = contract.getSignature(aliceOrder, alice.wallet);

            const georgeOrder = contract.constructOrder(
                george.wallet.address,
                tokenContractAddress,
                tokensAmount,
                etherAddress,
                etherAmount,
                georgeNonce,
                weidexContractAddress
            );
            const georgeSignature = contract.getSignature(georgeOrder, george.wallet);

            const orderAddresses = [[aliceMaker, tokenAddress, etherAddress], [georgeMaker, tokenAddress, etherAddress]];

            const orderValues = [[tokensAmount, etherAmount, aliceNonce], [tokensAmount, etherAmount, georgeNonce]];

            const takerSellAmounts = [takerSellAmount, takerSellAmount];
            const v = [aliceSignature.v, georgeSignature.v];
            const r = [aliceSignature.r, georgeSignature.r];
            const s = [aliceSignature.s, georgeSignature.s];

            weidexContract = weidexContract.connect(evelyn.wallet);
            await weidexContract.functions.takeAllPossible(orderAddresses, orderValues, takerSellAmounts, v, r, s, methodId);
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
