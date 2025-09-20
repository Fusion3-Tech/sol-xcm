// Auto-generated from Westend Asset Hub (westmint v1020000)
// Source WS: wss://westend-asset-hub-rpc.polkadot.io
pragma solidity ^0.8.24;

import "./ScaleCodec.sol";
import "./CallEncoders.sol";

// Auto-generated from Substrate struct StagingXcmV5Location

struct StagingXcmV5Location {
    uint8 parents;
    StagingXcmV5Junctions interior;
}

library StagingXcmV5LocationCodec {
    // SCALE encode: concatenate field encodings in declaration order
    function encode(StagingXcmV5Location memory s) internal pure returns (bytes memory) {
        return abi.encodePacked(U8Codec.encode(s.parents), StagingXcmV5JunctionsCodec.encode(s.interior));
    }
}

// Auto-generated from Substrate enum StagingXcmV5Junctions

enum StagingXcmV5Junctions {
    Here,
    X1,
    X2,
    X3,
    X4,
    X5,
    X6,
    X7,
    X8
}

library StagingXcmV5JunctionsCodec {
    // SCALE encode: variant index as a single byte (<= 256 variants)
    function encode(StagingXcmV5Junctions v) internal pure returns (bytes memory) {
        return abi.encodePacked(uint8(toIndex(v)));
    }

    function toIndex(StagingXcmV5Junctions v) internal pure returns (uint8) {
        if (v == StagingXcmV5Junctions.Here) return 0;
        if (v == StagingXcmV5Junctions.X1) return 1;
        if (v == StagingXcmV5Junctions.X2) return 2;
        if (v == StagingXcmV5Junctions.X3) return 3;
        if (v == StagingXcmV5Junctions.X4) return 4;
        if (v == StagingXcmV5Junctions.X5) return 5;
        if (v == StagingXcmV5Junctions.X6) return 6;
        if (v == StagingXcmV5Junctions.X7) return 7;
        if (v == StagingXcmV5Junctions.X8) return 8;
        revert("Invalid enum value");
    }

    function fromIndex(uint8 i) internal pure returns (StagingXcmV5Junctions v) {
        if (i == 0) return StagingXcmV5Junctions.Here;
        if (i == 1) return StagingXcmV5Junctions.X1;
        if (i == 2) return StagingXcmV5Junctions.X2;
        if (i == 3) return StagingXcmV5Junctions.X3;
        if (i == 4) return StagingXcmV5Junctions.X4;
        if (i == 5) return StagingXcmV5Junctions.X5;
        if (i == 6) return StagingXcmV5Junctions.X6;
        if (i == 7) return StagingXcmV5Junctions.X7;
        if (i == 8) return StagingXcmV5Junctions.X8;
        revert("Invalid enum index");
    }
}


/// @title Typed SCALE encoders for selected calls (supported classified args only)
library CallEncoders {
    /// @notice assetConversion.createPool
    function assetConversion_createPool(StagingXcmV5Location asset1, StagingXcmV5Location asset2) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(56, 0),
            StagingXcmV5LocationCodec.encode(asset1),
            StagingXcmV5LocationCodec.encode(asset2)
        );
    }

    /// @notice assetConversion.addLiquidity
    function assetConversion_addLiquidity(StagingXcmV5Location asset1, StagingXcmV5Location asset2, uint128 amount1_desired, uint128 amount2_desired, uint128 amount1_min, uint128 amount2_min, bytes32 mint_to) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(56, 1),
            StagingXcmV5LocationCodec.encode(asset1),
            StagingXcmV5LocationCodec.encode(asset2),
            ScaleCodec.u128LE(amount1_desired),
            ScaleCodec.u128LE(amount2_desired),
            ScaleCodec.u128LE(amount1_min),
            ScaleCodec.u128LE(amount2_min),
            ScaleCodec.u128LE(uint128(uint256(mint_to)))
        );
    }

    /// @notice assetConversion.removeLiquidity
    function assetConversion_removeLiquidity(StagingXcmV5Location asset1, StagingXcmV5Location asset2, uint128 lp_token_burn, uint128 amount1_min_receive, uint128 amount2_min_receive, bytes32 withdraw_to) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(56, 2),
            StagingXcmV5LocationCodec.encode(asset1),
            StagingXcmV5LocationCodec.encode(asset2),
            ScaleCodec.u128LE(lp_token_burn),
            ScaleCodec.u128LE(amount1_min_receive),
            ScaleCodec.u128LE(amount2_min_receive),
            ScaleCodec.u128LE(uint128(uint256(withdraw_to)))
        );
    }

    /// @notice assetConversion.swapExactTokensForTokens
    function assetConversion_swapExactTokensForTokens(Vec<StagingXcmV5Location> path, uint128 amount_in, uint128 amount_out_min, bytes32 send_to, bool keep_alive) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(56, 3),
            Vec<StagingXcmV5Location>Codec.encode(path),
            ScaleCodec.u128LE(amount_in),
            ScaleCodec.u128LE(amount_out_min),
            ScaleCodec.u128LE(uint128(uint256(send_to))),
            ScaleCodec.boolean(keep_alive)
        );
    }

    /// @notice assetConversion.swapTokensForExactTokens
    function assetConversion_swapTokensForExactTokens(Vec<StagingXcmV5Location> path, uint128 amount_out, uint128 amount_in_max, bytes32 send_to, bool keep_alive) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(56, 4),
            Vec<StagingXcmV5Location>Codec.encode(path),
            ScaleCodec.u128LE(amount_out),
            ScaleCodec.u128LE(amount_in_max),
            ScaleCodec.u128LE(uint128(uint256(send_to))),
            ScaleCodec.boolean(keep_alive)
        );
    }

    /// @notice assetConversion.touch
    function assetConversion_touch(StagingXcmV5Location asset1, StagingXcmV5Location asset2) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(56, 5),
            StagingXcmV5LocationCodec.encode(asset1),
            StagingXcmV5LocationCodec.encode(asset2)
        );
    }
}
    