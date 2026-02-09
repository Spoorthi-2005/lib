module.exports = {
  contracts_build_directory: "./client/src/contracts",
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
      gas: 6721975,
      gasPrice: 20000000000,
    },
    ganache1337: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
      gas: 6721975,
      gasPrice: 20000000000,
    },
    develop: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "1337",
      gas: 6721975,
      gasPrice: 20000000000,
    },
  },
  compilers: {
    solc: {
      version: "0.8.0",
    },
  },
};