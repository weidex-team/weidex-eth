const assert = require("assert");

module.exports = {
    assertString
};

function assertString(a, b) {
    assert.strictEqual(a.toString(), b.toString());
}
