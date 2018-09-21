const ethers = require("ethers");
const config = require("../config/config");

const privateKeys = [
    "0x4c0529b1e7440112716fcd03bf67ec49d30969346714141b2001acceecb32e08",
    "0x8f3881a3e06a024db45a428c7d531c76bbf2a323ffda2b5fa607b82e8c3c7836",
    "0xcc27c988aa726eceb7c65e97b7aedc82cfb6f6650c355490f2b9d3010a2f24cd",
    "0xfd09da5705b8c378cb9c6237e25f4ba0081470310386bb549e480ac9484e8ac5",
    "0xf1b10a93e6203f6531e4d24c2a2903a479846c92dd3f1011d6004a55c15d6a59",
    "0xb87290650366382138409b12d69049a611ba53b0171c9420878e20468edcd4d5",
    "0xc8eeb01485f3001f11ea3319132e42ba3901370f553c62297a42377eb54aa296",
    "0x5e355a956164216933612072b0f3ac7769b349ba0a2a24660743f3fe64eb4485",
    "0xa7c460f3c34f0feac4b20dd7be5e59879d0ef1666385e7ec525cc8645c1f652d",
    "0x6ac4e3695db0106d16ad229fd905351dd044002cdf579a8959a33fee9fd76ba6"
];

const provider = new ethers.providers.JsonRpcProvider(config.host, ethers.networks.mainnet);

const getWallet = privateKeyId => {
    const privateKey = privateKeys[privateKeyId];
    return new ethers.Wallet(privateKey, provider);
};

module.exports = { getWallet };
