// Auto-generated from Westend Asset Hub (westmint v1020000)
// Source WS: wss://westend-asset-hub-rpc.polkadot.io
pragma solidity ^0.8.24;

import "./ScaleCodec.sol";
import "./AssetconversionCallEncoder.sol";

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

enum StagingXcmV5JunctionsTag {
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

struct StagingXcmV5Junctions {
    StagingXcmV5JunctionsTag tag;
    bytes payload; // SCALE-encoded payload for the active variant
}

library StagingXcmV5JunctionsCodec {
    // Concatenate tag + payload
    function encode(StagingXcmV5Junctions memory e) internal pure returns (bytes memory) {
        return bytes.concat(abi.encodePacked(uint8(e.tag)), e.payload);
    }


    struct HerePayload {
            bytes _0;
        }
    
    struct X1Payload {
            bytes[1] _0;
        }
    
    struct X2Payload {
            bytes[2] _0;
        }
    
    struct X3Payload {
            bytes[3] _0;
        }
    
    struct X4Payload {
            bytes[4] _0;
        }
    
    struct X5Payload {
            bytes[5] _0;
        }
    
    struct X6Payload {
            bytes[6] _0;
        }
    
    struct X7Payload {
            bytes[7] _0;
        }
    
    struct X8Payload {
            bytes[8] _0;
        }


function Here(bytes _0) internal pure returns (StagingXcmV5Junctions memory e) {
            e.tag = StagingXcmV5JunctionsTag.Here;
            e.payload = _0;
          }
    
    function X1(bytes[1] _0) internal pure returns (StagingXcmV5Junctions memory e) {
            e.tag = StagingXcmV5JunctionsTag.X1;
            e.payload = ScaleFixedArray.encode_Lookup62_1(_0);
          }
    
    function X2(bytes[2] _0) internal pure returns (StagingXcmV5Junctions memory e) {
            e.tag = StagingXcmV5JunctionsTag.X2;
            e.payload = ScaleFixedArray.encode_Lookup62_2(_0);
          }
    
    function X3(bytes[3] _0) internal pure returns (StagingXcmV5Junctions memory e) {
            e.tag = StagingXcmV5JunctionsTag.X3;
            e.payload = ScaleFixedArray.encode_Lookup62_3(_0);
          }
    
    function X4(bytes[4] _0) internal pure returns (StagingXcmV5Junctions memory e) {
            e.tag = StagingXcmV5JunctionsTag.X4;
            e.payload = ScaleFixedArray.encode_Lookup62_4(_0);
          }
    
    function X5(bytes[5] _0) internal pure returns (StagingXcmV5Junctions memory e) {
            e.tag = StagingXcmV5JunctionsTag.X5;
            e.payload = ScaleFixedArray.encode_Lookup62_5(_0);
          }
    
    function X6(bytes[6] _0) internal pure returns (StagingXcmV5Junctions memory e) {
            e.tag = StagingXcmV5JunctionsTag.X6;
            e.payload = ScaleFixedArray.encode_Lookup62_6(_0);
          }
    
    function X7(bytes[7] _0) internal pure returns (StagingXcmV5Junctions memory e) {
            e.tag = StagingXcmV5JunctionsTag.X7;
            e.payload = ScaleFixedArray.encode_Lookup62_7(_0);
          }
    
    function X8(bytes[8] _0) internal pure returns (StagingXcmV5Junctions memory e) {
            e.tag = StagingXcmV5JunctionsTag.X8;
            e.payload = ScaleFixedArray.encode_Lookup62_8(_0);
          }
}

// Auto-generated from Substrate struct FrameSystemAccountInfo

struct FrameSystemAccountInfo {
    uint32 nonce;
    uint32 consumers;
    uint32 providers;
    uint32 sufficients;
    PalletBalancesAccountData data;
}

library FrameSystemAccountInfoCodec {
    // SCALE encode: concatenate field encodings in declaration order
    function encode(FrameSystemAccountInfo memory s) internal pure returns (bytes memory) {
        return abi.encodePacked(U32Codec.encode(s.nonce), U32Codec.encode(s.consumers), U32Codec.encode(s.providers), U32Codec.encode(s.sufficients), PalletBalancesAccountDataCodec.encode(s.data));
    }
}

// Auto-generated from Substrate struct PalletBalancesAccountData

struct PalletBalancesAccountData {
    uint128 free;
    uint128 reserved;
    uint128 frozen;
    uint128 flags;
}

library PalletBalancesAccountDataCodec {
    // SCALE encode: concatenate field encodings in declaration order
    function encode(PalletBalancesAccountData memory s) internal pure returns (bytes memory) {
        return abi.encodePacked(U128Codec.encode(s.free), U128Codec.encode(s.reserved), U128Codec.encode(s.frozen), U128Codec.encode(s.flags));
    }
}

// Auto-generated from Substrate enum StagingXcmV5JunctionNetworkId

enum StagingXcmV5JunctionNetworkIdTag {
    ByGenesis,
    ByFork,
    Polkadot,
    Kusama,
    Unused4,
    Unused5,
    Unused6,
    Ethereum,
    BitcoinCore,
    BitcoinCash,
    PolkadotBulletin
}

struct StagingXcmV5JunctionNetworkId {
    StagingXcmV5JunctionNetworkIdTag tag;
    bytes payload; // SCALE-encoded payload for the active variant
}

library StagingXcmV5JunctionNetworkIdCodec {
    // Concatenate tag + payload
    function encode(StagingXcmV5JunctionNetworkId memory e) internal pure returns (bytes memory) {
        return bytes.concat(abi.encodePacked(uint8(e.tag)), e.payload);
    }


    struct ByGenesisPayload {
            bytes32 _0;
        }
    
    struct ByForkPayload {
            bytes _0;
        }
    
    struct PolkadotPayload {
            bytes _0;
        }
    
    struct KusamaPayload {
            bytes _0;
        }
    
    struct Unused4Payload {
            bytes _0;
        }
    
    struct Unused5Payload {
            bytes _0;
        }
    
    struct Unused6Payload {
            bytes _0;
        }
    
    struct EthereumPayload {
            bytes _0;
        }
    
    struct BitcoinCorePayload {
            bytes _0;
        }
    
    struct BitcoinCashPayload {
            bytes _0;
        }
    
    struct PolkadotBulletinPayload {
            bytes _0;
        }


function ByGenesis(bytes32 _0) internal pure returns (StagingXcmV5JunctionNetworkId memory e) {
            e.tag = StagingXcmV5JunctionNetworkIdTag.ByGenesis;
            e.payload = ScaleFixedBytes.encode(bytes32(_0));
          }
    
    function ByFork(bytes _0) internal pure returns (StagingXcmV5JunctionNetworkId memory e) {
            e.tag = StagingXcmV5JunctionNetworkIdTag.ByFork;
            e.payload = _0;
          }
    
    function Polkadot(bytes _0) internal pure returns (StagingXcmV5JunctionNetworkId memory e) {
            e.tag = StagingXcmV5JunctionNetworkIdTag.Polkadot;
            e.payload = _0;
          }
    
    function Kusama(bytes _0) internal pure returns (StagingXcmV5JunctionNetworkId memory e) {
            e.tag = StagingXcmV5JunctionNetworkIdTag.Kusama;
            e.payload = _0;
          }
    
    function Unused4(bytes _0) internal pure returns (StagingXcmV5JunctionNetworkId memory e) {
            e.tag = StagingXcmV5JunctionNetworkIdTag.Unused4;
            e.payload = _0;
          }
    
    function Unused5(bytes _0) internal pure returns (StagingXcmV5JunctionNetworkId memory e) {
            e.tag = StagingXcmV5JunctionNetworkIdTag.Unused5;
            e.payload = _0;
          }
    
    function Unused6(bytes _0) internal pure returns (StagingXcmV5JunctionNetworkId memory e) {
            e.tag = StagingXcmV5JunctionNetworkIdTag.Unused6;
            e.payload = _0;
          }
    
    function Ethereum(bytes _0) internal pure returns (StagingXcmV5JunctionNetworkId memory e) {
            e.tag = StagingXcmV5JunctionNetworkIdTag.Ethereum;
            e.payload = _0;
          }
    
    function BitcoinCore(bytes _0) internal pure returns (StagingXcmV5JunctionNetworkId memory e) {
            e.tag = StagingXcmV5JunctionNetworkIdTag.BitcoinCore;
            e.payload = _0;
          }
    
    function BitcoinCash(bytes _0) internal pure returns (StagingXcmV5JunctionNetworkId memory e) {
            e.tag = StagingXcmV5JunctionNetworkIdTag.BitcoinCash;
            e.payload = _0;
          }
    
    function PolkadotBulletin(bytes _0) internal pure returns (StagingXcmV5JunctionNetworkId memory e) {
            e.tag = StagingXcmV5JunctionNetworkIdTag.PolkadotBulletin;
            e.payload = _0;
          }
}


/// @title Typed SCALE encoders for selected calls (supported classified args only)
library AssetconversionCallEncoder {
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
    