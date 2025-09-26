import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  plugins: [hardhatToolboxViem],
  paths: { sources: "src/" }
};

export default config;
