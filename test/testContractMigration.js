const assert = require("./helper/assert").assertString;
const ethers = require("ethers");
const actors = require("./config/actors");
const contract = require("./helper/contract");
const config = require("./config/config");
const utils = require("./helper/utils");

const etherAddress = config.etherAddress;
const { exchangeOwner, feeAccount, alice } = actors;

describe("migrate funds", async () => {
    let cfg;
    let weidexContract;
    let weidexContractAddress;
    let tokenContractAddress;
    let tokenContract;
    let newWeidexContract;
    let newWeidexContractAddress, newWeidexAbi;

    before(async () => {
        cfg = await utils.init();
        await initNexExchangeContract();
        weidexContract = cfg.exchange.instance;
        weidexContractAddress = cfg.exchange.address;
        tokenContractAddress = cfg.token.address;
        tokenContract = cfg.token.instance;

        await contract.transferTokens(cfg.token, alice.wallet, 100000);
        await contract.depositTokens(alice.wallet, cfg.token, cfg.exchange, 100000);
        await contract.depositEthers(cfg.exchange, alice.wallet, 10);
    });

    it("should have allowed migrations on the old contract", async () => {
        weidexContract = weidexContract.connect(exchangeOwner.wallet);

        await weidexContract.allowOrRestrictMigrations();

        const migrationsAllowed = await weidexContract.isMigrationAllowed();

        assert(migrationsAllowed, true);
    });

    it("should have allowed migrations on the new contract", async () => {
        await newWeidexContract.allowOrRestrictMigrations();

        const migrationsAllowed = await newWeidexContract.isMigrationAllowed();

        assert(migrationsAllowed, true);
    });

    it("should have new exchange address set", async () => {
        weidexContract = weidexContract.connect(exchangeOwner.wallet);

        await weidexContract.setNewExchangeAddress(newWeidexContractAddress);

        const newExchangeAddress = await weidexContract.newExchangeAddress();

        assert(newExchangeAddress, newWeidexContractAddress);
    });

    it("should have zero balance on the new exchange", async () => {
        newWeidexContract = newWeidexContract.connect(exchangeOwner.wallet);

        await utils.updateExchangeBalancesBefore(newWeidexContract, tokenContractAddress);
        assert(alice.exchangeBalanceBefore, "0");

        await utils.updateExchangeBalancesBefore(newWeidexContract, etherAddress);
        assert(alice.exchangeBalanceBefore, "0");
    });

    it("should have correct balance on the old exchange", async () => {
        await utils.updateExchangeBalancesBefore(weidexContract, tokenContractAddress);
        assert(alice.exchangeBalanceBefore, "100000000000000000000000");

        await utils.updateExchangeBalancesBefore(weidexContract, etherAddress);
        assert(alice.exchangeBalanceBefore, "10000000000000000000");
    });

    it("should have funds of Alice transferred to the new exchange", async () => {
        weidexContract = weidexContract.connect(alice.wallet);

        await weidexContract.migrateFunds([tokenContractAddress, cfg.token10Decimals.address]);

        await utils.updateExchangeBalancesAfter(newWeidexContract, tokenContractAddress);
        assert(alice.exchangeBalanceAfter, "100000000000000000000000");

        await utils.updateExchangeBalancesAfter(weidexContract, tokenContractAddress);
        assert(alice.exchangeBalanceAfter, "0");

        await utils.updateExchangeBalancesAfter(newWeidexContract, etherAddress);
        assert(alice.exchangeBalanceAfter, "10000000000000000000");

        await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
        assert(alice.exchangeBalanceAfter, "0");

        const oldWeidexContractBalance = await tokenContract.balanceOf(weidexContractAddress);
        const newWeidexContractBalance = await tokenContract.balanceOf(newWeidexContractAddress);
        assert(oldWeidexContractBalance, "0");
        assert(newWeidexContractBalance, "100000000000000000000000");
    });

    async function initNexExchangeContract() {
        [newWeidexContractAddress, newWeidexAbi] = await contract.deployNewWeidexExchangeContract(exchangeOwner.wallet, feeAccount);

        newWeidexContract = new ethers.Contract(newWeidexContractAddress, newWeidexAbi, exchangeOwner.wallet);
    }
});
