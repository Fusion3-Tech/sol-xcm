// hardhat.config.cjs
require('@parity/hardhat-polkadot');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.24',
  },
  polkasolc: {
    compilerSource: 'npm',
  },
  networks: {
    hardhat: {
      polkavm: true,
    },
  },
};