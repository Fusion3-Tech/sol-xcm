// Auto-generated from Westend Asset Hub (westmint v1020000)
// Source WS: wss://westend-asset-hub-rpc.polkadot.io
pragma solidity ^0.8.24;

import "./ScaleCodec.sol";
import "./CallEncoders.sol";

/// @title Typed SCALE encoders for selected calls (supported classified args only)
library CallEncoders {
    /// @notice balances.transferAllowDeath
    function balances_transferAllowDeath_id32(bytes32 dest, uint128 value) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(10, 0),
            ScaleCodec.multiAddressId32(dest),
            ScaleCodec.compactU128(value)
        );
    }

    /// @notice balances.forceTransfer
    function balances_forceTransfer_id32(bytes32 source, bytes32 dest, uint128 value) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(10, 2),
            ScaleCodec.multiAddressId32(source),
            ScaleCodec.multiAddressId32(dest),
            ScaleCodec.compactU128(value)
        );
    }

    /// @notice balances.transferKeepAlive
    function balances_transferKeepAlive_id32(bytes32 dest, uint128 value) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(10, 3),
            ScaleCodec.multiAddressId32(dest),
            ScaleCodec.compactU128(value)
        );
    }

    /// @notice balances.transferAll
    function balances_transferAll_id32(bytes32 dest, bool keep_alive) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(10, 4),
            ScaleCodec.multiAddressId32(dest),
            ScaleCodec.boolean(keep_alive)
        );
    }

    /// @notice balances.forceUnreserve
    function balances_forceUnreserve_id32(bytes32 who, uint128 amount) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(10, 5),
            ScaleCodec.multiAddressId32(who),
            ScaleCodec.u128LE(amount)
        );
    }

    /// @notice balances.upgradeAccounts
    function balances_upgradeAccounts(bytes32 who) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(10, 6),
            ScaleCodec.u128LE(uint128(uint256(who)))
        );
    }

    /// @notice balances.forceSetBalance
    function balances_forceSetBalance_id32(bytes32 who, uint128 new_free) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(10, 8),
            ScaleCodec.multiAddressId32(who),
            ScaleCodec.compactU128(new_free)
        );
    }

    // Skipped balances.forceAdjustTotalIssuance: unsupported arg types: direction:PalletBalancesAdjustmentDirection, delta:Compact<u128>

    /// @notice balances.burn
    function balances_burn(uint128 value, bool keep_alive) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(10, 10),
            ScaleCodec.compactU128(value),
            ScaleCodec.boolean(keep_alive)
        );
    }
}
    