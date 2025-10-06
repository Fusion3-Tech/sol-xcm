// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../../../contracts/AssetconversionCallEncoder.sol";

contract AssetconversionCallEncoderHarness {
    /// @notice assetConversion.createPool
    function assetConversion_createPool(StagingXcmV5Location calldata asset1, StagingXcmV5Location calldata asset2) external pure returns (bytes memory) {
        return AssetconversionCallEncoder.assetConversion_createPool(asset1, asset2);
    }

    /// @notice assetConversion.addLiquidity
    function assetConversion_addLiquidity(StagingXcmV5Location calldata asset1, StagingXcmV5Location calldata asset2, uint128 amount1_desired, uint128 amount2_desired, uint128 amount1_min, uint128 amount2_min, bytes32 mint_to) external pure returns (bytes memory) {
        return AssetconversionCallEncoder.assetConversion_addLiquidity(asset1, asset2, amount1_desired, amount2_desired, amount1_min, amount2_min, mint_to);
    }

    /// @notice assetConversion.removeLiquidity
    function assetConversion_removeLiquidity(StagingXcmV5Location calldata asset1, StagingXcmV5Location calldata asset2, uint128 lp_token_burn, uint128 amount1_min_receive, uint128 amount2_min_receive, bytes32 withdraw_to) external pure returns (bytes memory) {
        return AssetconversionCallEncoder.assetConversion_removeLiquidity(asset1, asset2, lp_token_burn, amount1_min_receive, amount2_min_receive, withdraw_to);
    }

    /// @notice assetConversion.swapExactTokensForTokens
    function assetConversion_swapExactTokensForTokens(StagingXcmV5Location[] calldata path, uint128 amount_in, uint128 amount_out_min, bytes32 send_to, bool keep_alive) external pure returns (bytes memory) {
        return AssetconversionCallEncoder.assetConversion_swapExactTokensForTokens(path, amount_in, amount_out_min, send_to, keep_alive);
    }

    /// @notice assetConversion.swapTokensForExactTokens
    function assetConversion_swapTokensForExactTokens(StagingXcmV5Location[] calldata path, uint128 amount_out, uint128 amount_in_max, bytes32 send_to, bool keep_alive) external pure returns (bytes memory) {
        return AssetconversionCallEncoder.assetConversion_swapTokensForExactTokens(path, amount_out, amount_in_max, send_to, keep_alive);
    }

    /// @notice assetConversion.touch
    function assetConversion_touch(StagingXcmV5Location calldata asset1, StagingXcmV5Location calldata asset2) external pure returns (bytes memory) {
        return AssetconversionCallEncoder.assetConversion_touch(asset1, asset2);
    }
}