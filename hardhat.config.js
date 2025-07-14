require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId:31337, // Must match your frontend's expected chainId
    },
    hardhat: {
      chainId: 31337, // Same as localhost for consistency
    }
  },
  paths: {
    artifacts: "./client/src/artifacts",
  }
};