// Auto-generated from Westend Asset Hub (westmint v1018013)
// Source WS: wss://westend-asset-hub-rpc.polkadot.io
pragma solidity ^0.8.24;

import "../src/ScaleCodec.sol";
import "./PalletCalls.sol";

/// @title Typed SCALE encoders for selected calls (supported arg kinds only)
library CallEncoders {
    /// @notice system.remark
    function system_remark(bytes memory remark) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(0, 0),
            ScaleCodec.vecU8(remark)
        );
    }

    /// @notice system.setHeapPages
    function system_setHeapPages(uint64 pages) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(0, 1),
            ScaleCodec.u64LE(pages)
        );
    }

    /// @notice system.setCode
    function system_setCode(bytes memory code) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(0, 2),
            ScaleCodec.vecU8(code)
        );
    }

    /// @notice system.setCodeWithoutChecks
    function system_setCodeWithoutChecks(bytes memory code) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(0, 3),
            ScaleCodec.vecU8(code)
        );
    }

    // Skipped system.setStorage: unsupported arg types: items:Vec<KeyValue>

    // Skipped system.killStorage: unsupported arg types: keys:Vec<Key>

    // Skipped system.killPrefix: unsupported arg types: prefix:Key, subkeys:u32

    /// @notice system.remarkWithEvent
    function system_remarkWithEvent(bytes memory remark) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(0, 7),
            ScaleCodec.vecU8(remark)
        );
    }

    // Skipped system.authorizeUpgrade: unsupported arg types: codeHash:Hash

    // Skipped system.authorizeUpgradeWithoutChecks: unsupported arg types: codeHash:Hash

    /// @notice system.applyAuthorizedUpgrade
    function system_applyAuthorizedUpgrade(bytes memory code) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(0, 11),
            ScaleCodec.vecU8(code)
        );
    }
}
