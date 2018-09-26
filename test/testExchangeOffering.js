var { bigNumberify } = require('ethers').utils;
const assert = require("./helper/assert").assertString;
const utils = require("./helper/utils");
const contract = require("./helper/contract");
const config = require("./config/config");

const { latestTime, duration, timeTravel } = require("./helper/time");
const { expectThrow } = require('./helper/exceptions')
const { alice, evelyn } = utils.actors;

const etherAddress = config.etherAddress;

describe("exchange offering", () => {
    let cfg;
    let tokenAddress;
    let weidexContract;
    let weidexAddress;

    before(async () => {
        cfg = await utils.init();
        weidexContract = cfg.exchange.instance;
        tokenAddress = cfg.token.address;
        weidexAddress = cfg.exchange.address;
        await utils.updateExchangeBalancesBefore(weidexContract, etherAddress);
    });

    it("should register crowdsale project", async () => {
        const startTime = (await latestTime()) + duration.minutes(10);
        const endTime = startTime + duration.days(5);
        const capacity = "1000000000000000000000"; // 1000
        const leftAmount = "1000000000000000000000"; // 1000
        const tokenRatio = 10; // 1 eth = 10 tokens
        const minContribution = "500000000000000000";
        const maxContribution = "2000000000000000000000" // 2000;
        const weiRaised = 0;

        const values = [startTime, endTime, capacity, leftAmount, tokenRatio, minContribution, maxContribution, weiRaised];

        const wallet = alice.wallet.address;

        await weidexContract.registerCrowdsale(tokenAddress, wallet, values);

        const crowdsale = await weidexContract.crowdsales(tokenAddress);

        assert(crowdsale[0], values[0]);
        assert(crowdsale[1], values[1]);
        assert(crowdsale[2], values[2]);
        assert(crowdsale[3], values[3]);
        assert(crowdsale[4], values[4]);
        assert(crowdsale[5], values[5]);
        assert(crowdsale[6], values[6]);
        assert(crowdsale[7], values[7]);
        assert(crowdsale[8], wallet);
    });

    it("should have closed sale", async () => {
        const isOpen = await weidexContract.saleOpen(tokenAddress);
        assert(isOpen, false);
    });

    it("should fail due to crowdsale not open yet", async() => {
        const options = { value: 1000000000000000000 };
        await expectThrow(weidexContract.buyTokens(tokenAddress, options), 'revert');
    });

    it("should have open sale", async () => {
        await timeTravel(duration.minutes(15))
        const isOpen = await weidexContract.saleOpen(tokenAddress);
        assert(isOpen, true);
    });

    it("should return correct bonus factor", async () => {
        const bonusFactor = await weidexContract.getBonusFactor(tokenAddress, 0);
        assert(bonusFactor, 0);
    });

    it("should return true if user is whitelisted", async () => {
        const isUserWhitelisted = await weidexContract.isUserWhitelisted(tokenAddress, alice.wallet.address);
        assert(isUserWhitelisted, true);
    });

    it("should fail due to max contribution amount when trying to contribute", async() => {
        const options = { value: 2100000000000000000000 };
        await expectThrow(weidexContract.buyTokens(tokenAddress, options), 'revert');
    });

    it("should fail due to minimum contribution amount when trying to contribute", async() => {
        const options = { value: 100000000000000000 };
        await expectThrow(weidexContract.buyTokens(tokenAddress, options), 'revert');
    });

    it("should fail due to capacity overflow", async() => {
        const options = { value: 1200000000000000000000 };
        await expectThrow(weidexContract.buyTokens(tokenAddress, options), 'revert');
    });

    it("should fail when user different than crowdsale owner tries to withdraw", async () => {
        weidexContract = weidexContract.connect(evelyn.wallet);
        await expectThrow(weidexContract.withdrawWhenFinished(tokenAddress), 'revert');
    });

    it("should fail when crowdsale owner tries to withdraw funds while crowdsale is open", async () => {
        weidexContract = weidexContract.connect(alice.wallet);
        await expectThrow(weidexContract.withdrawWhenFinished(tokenAddress), 'revert');
    });

    it("should try to buy token and fail because there are no funds in the contract", async () => {

        const options = { value: 1000000000000000000 };
        await expectThrow(weidexContract.buyTokens(tokenAddress, options), 'revert');

        const isUserWhitelisted = await weidexContract.isUserWhitelisted(tokenAddress, alice.wallet.address);
        assert(isUserWhitelisted, true);
    });

    it("should fail due to msg.value equals to zero", async () => {
        const options = { value: 0 };
        await expectThrow(weidexContract.buyTokens(tokenAddress, options), 'revert');
    });

    it("should buy with success", async () => {
        await contract.transferTokensFor(cfg.token, alice.wallet, 1000, weidexAddress);

        const options = { value: 1000000000000000000 };

        await weidexContract.buyTokens(tokenAddress, options);
    });

    it("should have correct properties for the crowdsale project", async () => {

        const options = { value: 1000000000000000000 };

        const userContributionBefore = await weidexContract.userContributionForProject(tokenAddress, alice.wallet.address);
        const crowdsaleBefore = await weidexContract.crowdsales(tokenAddress);

        await weidexContract.buyTokens(tokenAddress, options);

        const crowdsaleAfter = await weidexContract.crowdsales(tokenAddress);

        assert(crowdsaleBefore[0], crowdsaleAfter[0]);
        assert(crowdsaleBefore[1], crowdsaleAfter[1]);
        assert(crowdsaleBefore[2], crowdsaleAfter[2]);
        assert(crowdsaleBefore[3].sub(bigNumberify("1000000000000000000").mul(crowdsaleAfter[4])), crowdsaleAfter[3]);
        assert(crowdsaleBefore[4], crowdsaleAfter[4]);
        assert(crowdsaleBefore[5], crowdsaleAfter[5]);
        assert(crowdsaleBefore[6], crowdsaleAfter[6]);
        assert(crowdsaleBefore[7].add(bigNumberify("1000000000000000000")), crowdsaleAfter[7]);
        assert(crowdsaleBefore[8], alice.wallet.address);

        const userContributionAfter = await weidexContract.userContributionForProject(tokenAddress, alice.wallet.address);

        assert(userContributionBefore.add(bigNumberify("1000000000000000000")), userContributionAfter);
    });

    it("should have sent correct amount to the contributor", async () => {
        const crowdsale = await weidexContract.crowdsales(tokenAddress);
        await utils.updateTokenBalancesAfter(cfg.token.instance, tokenAddress);
        assert(alice.tokenBalanceAfter, bigNumberify("2000000000000000000").mul(crowdsale[4]));
    });

    it("should have correct exchange balance for the crowdsale owner", async() => {
        await utils.updateExchangeBalancesAfter(weidexContract, etherAddress);
        assert(alice.exchangeBalanceAfter, alice.exchangeBalanceBefore.add("2000000000000000000"));
    });

    it("should end", async() => {
        await timeTravel(duration.days(5))
        const isOpen = await weidexContract.saleOpen(tokenAddress);
        assert(isOpen, false);
    });

    it("should withdraw with success", async() => {
        const crowdsaleBefore = await weidexContract.crowdsales(tokenAddress);
        const balanceBefore = await cfg.token.instance.balanceOf(crowdsaleBefore[8]);

        weidexContract = weidexContract.connect(alice.wallet);
        await weidexContract.withdrawWhenFinished(tokenAddress);

        const crowdsaleAfter = await weidexContract.crowdsales(tokenAddress);
        const balanceAfter = await cfg.token.instance.balanceOf(crowdsaleAfter[8]);

        assert(crowdsaleBefore[3].sub(crowdsaleBefore[3]), crowdsaleAfter[3]);
        assert(balanceBefore.add(crowdsaleBefore[3]), balanceAfter);
    });
});