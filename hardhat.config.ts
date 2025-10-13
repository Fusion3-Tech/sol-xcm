import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  plugins: [hardhatToolboxViem],
  paths: { 
    sources: "src/contracts/src/",
    tests: "src/contracts/test/",
    artifacts: "src/contracts/artifacts/",
    cache: "src/contracts/cache/"
  },
};

export default config;
