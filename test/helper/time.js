const jsonrpc = '2.0'
const Web3 = require("web3");

const config = require("../config/config");
const web3 = new Web3(new Web3.providers.HttpProvider(config.host));

async function timeTravel(seconds) {
    await web3.currentProvider.send({
        jsonrpc,
        method: 'evm_increaseTime',
        params: [seconds],
        id: new Date().getSeconds()
      });

    await web3.currentProvider.send({
        jsonrpc,
        method: 'evm_mine',
        params: [],
        id: new Date().getSeconds()
    });
}

// Returns the time of the last mined block in seconds
async function latestTime () {
    const block = await web3.eth.getBlock('latest');
    return block.timestamp;
}

const duration = {
    seconds: function (val) { return val; },
    minutes: function (val) { return val * this.seconds(60); },
    hours: function (val) { return val * this.minutes(60); },
    days: function (val) { return val * this.hours(24); },
    weeks: function (val) { return val * this.days(7); },
    years: function (val) { return val * this.days(365); },
  };

module.exports = { timeTravel, duration, latestTime }
