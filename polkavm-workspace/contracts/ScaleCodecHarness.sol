// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./ScaleCodec.sol";

contract ScaleCodecHarness {
    function u8(uint8 v) external pure returns (bytes memory) {
        return ScaleCodec.u8(v);
    }

    function u16LE(uint16 v) external pure returns (bytes memory) {
        return ScaleCodec.u16LE(v);
    }

    function u32LE(uint32 v) external pure returns (bytes memory) {
        return ScaleCodec.u32LE(v);
    }

    function u64LE(uint64 v) external pure returns (bytes memory) {
        return ScaleCodec.u64LE(v);
    }

    function u128LE(uint128 v) external pure returns (bytes memory) {
        return ScaleCodec.u128LE(v);
    }

    // --- Compact-uint per Substrate SCALE spec (covers up to uint256) ---

    function compactUint(uint256 x) external pure returns (bytes memory) {
        return ScaleCodec.compactUint(x);
    }

    function compactU128(uint128 x) external pure returns (bytes memory) {
        return ScaleCodec.compactU128(x);
    }

    function compactU32(uint32 x) external pure returns (bytes memory) {
        return ScaleCodec.compactU32(x);
    }

    // --- Vec<u8> / Bytes ---
    function vecU8(bytes memory data) external pure returns (bytes memory) {
        return ScaleCodec.vecU8(data);
    }

    // --- bool ---
    function boolean(bool v) external pure returns (bytes memory) {
        return ScaleCodec.boolean(v);
    }

    // --- Option<T> (some = 0x01 + T, none = 0x00) ---
    function optionNone() external pure returns (bytes memory) {
        return ScaleCodec.optionNone();
    }

    function optionSome(bytes memory encodedT) external pure returns (bytes memory) {
        return ScaleCodec.optionSome(encodedT);
    }

    // --- MultiAddress::Id(AccountId32) ---
    // Variant index 0x00 followed by 32B AccountId.
    function multiAddressId32(bytes32 accountId32) external pure returns (bytes memory) {
        return ScaleCodec.multiAddressId32(accountId32);
    }

    // --- Call index (2 bytes: pallet, call) ---
    function callIndex(uint8 palletIndex, uint8 callIndex_) external pure returns (bytes memory) {
        return ScaleCodec.callIndex(palletIndex, callIndex_);
    }
}