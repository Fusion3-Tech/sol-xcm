// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BalancesCallEncoder.sol";

contract BalancesCallEncoderHarness {
    /// @notice balances.transferAllowDeath
    function balances_transferAllowDeath(bytes32 dest, uint128 value) external pure returns (bytes memory) {
        return BalancesCallEncoder.balances_transferAllowDeath(dest, value);
    }

    /// @notice balances.forceTransfer
    function balances_forceTransfer(bytes32 source, bytes32 dest, uint128 value) external pure returns (bytes memory) {
        return BalancesCallEncoder.balances_forceTransfer(source, dest, value);
    }

    /// @notice balances.transferKeepAlive
    function balances_transferKeepAlive(bytes32 dest, uint128 value) external pure returns (bytes memory) {
        return BalancesCallEncoder.balances_transferKeepAlive(dest, value);
    }

    /// @notice balances.transferAll
    function balances_transferAll(bytes32 dest, bool keep_alive) external pure returns (bytes memory) {
        return BalancesCallEncoder.balances_transferAll(dest, keep_alive);
    }

    /// @notice balances.forceUnreserve
    function balances_forceUnreserve(bytes32 who, uint128 amount) external pure returns (bytes memory) {
        return BalancesCallEncoder.balances_forceUnreserve(who, amount);
    }

    /// @notice balances.upgradeAccounts
    function balances_upgradeAccounts(bytes32 who) external pure returns (bytes memory) {
        return BalancesCallEncoder.balances_upgradeAccounts(who);
    }

    /// @notice balances.forceSetBalance
    function balances_forceSetBalance(bytes32 who, uint128 new_free) external pure returns (bytes memory) {
        return BalancesCallEncoder.balances_forceSetBalance(who, new_free);
    }

    /// @notice balances.forceAdjustTotalIssuance
    function balances_forceAdjustTotalIssuance(PalletBalancesAdjustmentDirection calldata direction, uint128 delta) external pure returns (bytes memory) {
        return BalancesCallEncoder.balances_forceAdjustTotalIssuance(direction, delta);
    }

    /// @notice balances.burn
    function balances_burn(uint128 value, bool keep_alive) external pure returns (bytes memory) {
        return BalancesCallEncoder.balances_burn(value, keep_alive);
    }
}