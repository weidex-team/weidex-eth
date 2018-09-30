const deposit = require("./deposit");
const withdraw = require("./withdraw");
const order = require("./order");
const deployer = require("./deployer");
const transfer = require("./transfer");

module.exports = {
    ...deposit,
    ...withdraw,
    ...order,
    ...deployer,
    ...transfer
};
