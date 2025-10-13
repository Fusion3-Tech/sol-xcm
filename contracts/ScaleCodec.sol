// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Minimal SCALE encoding helpers needed for common FRAME calls
library ScaleCodec {
    // --- Little-endian fixed integers ---

    function u8(uint8 v) internal pure returns (bytes memory) {
        return abi.encodePacked(bytes1(v));
    }

    function u16LE(uint16 v) internal pure returns (bytes memory) {
        return abi.encodePacked(bytes1(uint8(v)), bytes1(uint8(v >> 8)));
    }

    function u32LE(uint32 v) internal pure returns (bytes memory) {
        return abi.encodePacked(
            bytes1(uint8(v)),
            bytes1(uint8(v >> 8)),
            bytes1(uint8(v >> 16)),
            bytes1(uint8(v >> 24))
        );
    }

    function u64LE(uint64 v) internal pure returns (bytes memory) {
        bytes memory out = new bytes(8);
        for (uint256 i = 0; i < 8; i++) {
            out[i] = bytes1(uint8(v >> (8 * i)));
        }
        return out;
    }

    function u128LE(uint128 v) internal pure returns (bytes memory) {
        bytes memory out = new bytes(16);
        for (uint256 i = 0; i < 16; i++) {
            out[i] = bytes1(uint8(v >> (8 * i)));
        }
        return out;
    }

    // --- Compact-uint per Substrate SCALE spec (covers up to uint256) ---

    function _toLEBytesNoZeros(uint256 x) private pure returns (bytes memory) {
        if (x == 0) return hex"00";
        bytes memory r = new bytes(32);
        uint256 len = 0;
        while (x != 0) {
            r[len] = bytes1(uint8(x)); // little-endian
            x >>= 8;
            len++;
        }
        assembly {
            mstore(r, len)
        }
        return r;
    }

    function compactUint(uint256 x) internal pure returns (bytes memory) {
        // single-byte mode
        if (x < (1 << 6)) {
            return abi.encodePacked(bytes1(uint8((x << 2) | 0x00)));
        }
        // two-byte mode
        if (x < (1 << 14)) {
            uint16 v = uint16((x << 2) | 0x01);
            return u16LE(v);
        }
        // four-byte mode
        if (x < (1 << 30)) {
            uint32 v = uint32((x << 2) | 0x02);
            return u32LE(v);
        }
        // big-integer mode: header + LE bytes (min 4 bytes)
        bytes memory le = _toLEBytesNoZeros(x);
        uint256 L = le.length;
        if (L < 4) {
            // pad to 4 if necessary (rare for small x>=2^30 but < 2^32)
            bytes memory padded = new bytes(4);
            for (uint256 i = 0; i < L; i++) padded[i] = le[i];
            le = padded;
            L = 4;
        }
        require(L <= 67, "compact: length too large"); // SCALE limit
        bytes1 header = bytes1(uint8(((L - 4) << 2) | 0x03));
        return bytes.concat(header, le);
    }

    function compactU128(uint128 x) internal pure returns (bytes memory) {
        return compactUint(uint256(x));
    }

    function compactU32(uint32 x) internal pure returns (bytes memory) {
        return compactUint(uint256(x));
    }

    // --- Vec<u8> / Bytes ---
    function vecU8(bytes memory data) internal pure returns (bytes memory) {
        return bytes.concat(compactUint(data.length), data);
    }

    // --- bool ---
    function boolean(bool v) internal pure returns (bytes memory) {
        if(v) {
            return hex"01";
        }else {
            return hex"00";
        }
    }

    // --- Option<T> (some = 0x01 + T, none = 0x00) ---
    function optionNone() internal pure returns (bytes memory) {
        return hex"00";
    }

    function optionSome(bytes memory encodedT) internal pure returns (bytes memory) {
        return bytes.concat(hex"01", encodedT);
    }

    // --- MultiAddress::Id(AccountId32) ---
    // Variant index 0x00 followed by 32B AccountId.
    function multiAddressId32(bytes32 accountId32) internal pure returns (bytes memory) {
        return bytes.concat(hex"00", abi.encodePacked(accountId32));
    }

    // --- Call index (2 bytes: pallet, call) ---
    function callIndex(uint8 palletIndex, uint8 callIndex_) internal pure returns (bytes memory) {
        return abi.encodePacked(bytes1(palletIndex), bytes1(callIndex_));
    }
}
