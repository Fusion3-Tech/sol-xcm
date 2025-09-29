// Auto-generated from Westend Asset Hub (westmint v1020000)
// Source WS: wss://westend-asset-hub-rpc.polkadot.io
pragma solidity ^0.8.24;

import "./ScaleCodec.sol";
import "./ForeignassetsCallEncoder.sol";

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
library ForeignassetsCallEncoder {
    /// @notice foreignAssets.create
    function foreignAssets_create(StagingXcmV5Location id, bytes32 admin, uint128 min_balance) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 0),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(admin),
            ScaleCodec.u128LE(min_balance)
        );
    }

    /// @notice foreignAssets.forceCreate
    function foreignAssets_forceCreate(StagingXcmV5Location id, bytes32 owner, bool is_sufficient, uint128 min_balance) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 1),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(owner),
            ScaleCodec.boolean(is_sufficient),
            ScaleCodec.compactU128(min_balance)
        );
    }

    /// @notice foreignAssets.startDestroy
    function foreignAssets_startDestroy(StagingXcmV5Location id) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 2),
            StagingXcmV5LocationCodec.encode(id)
        );
    }

    /// @notice foreignAssets.destroyAccounts
    function foreignAssets_destroyAccounts(StagingXcmV5Location id) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 3),
            StagingXcmV5LocationCodec.encode(id)
        );
    }

    /// @notice foreignAssets.destroyApprovals
    function foreignAssets_destroyApprovals(StagingXcmV5Location id) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 4),
            StagingXcmV5LocationCodec.encode(id)
        );
    }

    /// @notice foreignAssets.finishDestroy
    function foreignAssets_finishDestroy(StagingXcmV5Location id) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 5),
            StagingXcmV5LocationCodec.encode(id)
        );
    }

    /// @notice foreignAssets.mint
    function foreignAssets_mint(StagingXcmV5Location id, bytes32 beneficiary, uint128 amount) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 6),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(beneficiary),
            ScaleCodec.compactU128(amount)
        );
    }

    /// @notice foreignAssets.burn
    function foreignAssets_burn(StagingXcmV5Location id, bytes32 who, uint128 amount) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 7),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(who),
            ScaleCodec.compactU128(amount)
        );
    }

    /// @notice foreignAssets.transfer
    function foreignAssets_transfer(StagingXcmV5Location id, bytes32 target, uint128 amount) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 8),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(target),
            ScaleCodec.compactU128(amount)
        );
    }

    /// @notice foreignAssets.transferKeepAlive
    function foreignAssets_transferKeepAlive(StagingXcmV5Location id, bytes32 target, uint128 amount) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 9),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(target),
            ScaleCodec.compactU128(amount)
        );
    }

    /// @notice foreignAssets.forceTransfer
    function foreignAssets_forceTransfer(StagingXcmV5Location id, bytes32 source, bytes32 dest, uint128 amount) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 10),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(source),
            ScaleCodec.multiAddressId32(dest),
            ScaleCodec.compactU128(amount)
        );
    }

    /// @notice foreignAssets.freeze
    function foreignAssets_freeze(StagingXcmV5Location id, bytes32 who) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 11),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(who)
        );
    }

    /// @notice foreignAssets.thaw
    function foreignAssets_thaw(StagingXcmV5Location id, bytes32 who) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 12),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(who)
        );
    }

    /// @notice foreignAssets.freezeAsset
    function foreignAssets_freezeAsset(StagingXcmV5Location id) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 13),
            StagingXcmV5LocationCodec.encode(id)
        );
    }

    /// @notice foreignAssets.thawAsset
    function foreignAssets_thawAsset(StagingXcmV5Location id) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 14),
            StagingXcmV5LocationCodec.encode(id)
        );
    }

    /// @notice foreignAssets.transferOwnership
    function foreignAssets_transferOwnership(StagingXcmV5Location id, bytes32 owner) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 15),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(owner)
        );
    }

    /// @notice foreignAssets.setTeam
    function foreignAssets_setTeam(StagingXcmV5Location id, bytes32 issuer, bytes32 admin, bytes32 freezer) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 16),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(issuer),
            ScaleCodec.multiAddressId32(admin),
            ScaleCodec.multiAddressId32(freezer)
        );
    }

    /// @notice foreignAssets.setMetadata
    function foreignAssets_setMetadata(StagingXcmV5Location id, bytes memory name, bytes memory symbol, uint8 decimals) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 17),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.vecU8(name),
            ScaleCodec.vecU8(symbol),
            ScaleCodec.u8(decimals)
        );
    }

    /// @notice foreignAssets.clearMetadata
    function foreignAssets_clearMetadata(StagingXcmV5Location id) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 18),
            StagingXcmV5LocationCodec.encode(id)
        );
    }

    /// @notice foreignAssets.forceSetMetadata
    function foreignAssets_forceSetMetadata(StagingXcmV5Location id, bytes memory name, bytes memory symbol, uint8 decimals, bool is_frozen) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 19),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.vecU8(name),
            ScaleCodec.vecU8(symbol),
            ScaleCodec.u8(decimals),
            ScaleCodec.boolean(is_frozen)
        );
    }

    /// @notice foreignAssets.forceClearMetadata
    function foreignAssets_forceClearMetadata(StagingXcmV5Location id) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 20),
            StagingXcmV5LocationCodec.encode(id)
        );
    }

    /// @notice foreignAssets.forceAssetStatus
    function foreignAssets_forceAssetStatus(StagingXcmV5Location id, bytes32 owner, bytes32 issuer, bytes32 admin, bytes32 freezer, uint128 min_balance, bool is_sufficient, bool is_frozen) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 21),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(owner),
            ScaleCodec.multiAddressId32(issuer),
            ScaleCodec.multiAddressId32(admin),
            ScaleCodec.multiAddressId32(freezer),
            ScaleCodec.compactU128(min_balance),
            ScaleCodec.boolean(is_sufficient),
            ScaleCodec.boolean(is_frozen)
        );
    }

    /// @notice foreignAssets.approveTransfer
    function foreignAssets_approveTransfer(StagingXcmV5Location id, bytes32 delegate, uint128 amount) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 22),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(delegate),
            ScaleCodec.compactU128(amount)
        );
    }

    /// @notice foreignAssets.cancelApproval
    function foreignAssets_cancelApproval(StagingXcmV5Location id, bytes32 delegate) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 23),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(delegate)
        );
    }

    /// @notice foreignAssets.forceCancelApproval
    function foreignAssets_forceCancelApproval(StagingXcmV5Location id, bytes32 owner, bytes32 delegate) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 24),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(owner),
            ScaleCodec.multiAddressId32(delegate)
        );
    }

    /// @notice foreignAssets.transferApproved
    function foreignAssets_transferApproved(StagingXcmV5Location id, bytes32 owner, bytes32 destination, uint128 amount) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 25),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(owner),
            ScaleCodec.multiAddressId32(destination),
            ScaleCodec.compactU128(amount)
        );
    }

    /// @notice foreignAssets.touch
    function foreignAssets_touch(StagingXcmV5Location id) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 26),
            StagingXcmV5LocationCodec.encode(id)
        );
    }

    /// @notice foreignAssets.refund
    function foreignAssets_refund(StagingXcmV5Location id, bool allow_burn) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 27),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.boolean(allow_burn)
        );
    }

    /// @notice foreignAssets.setMinBalance
    function foreignAssets_setMinBalance(StagingXcmV5Location id, uint128 min_balance) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 28),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.u128LE(min_balance)
        );
    }

    /// @notice foreignAssets.touchOther
    function foreignAssets_touchOther(StagingXcmV5Location id, bytes32 who) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 29),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(who)
        );
    }

    /// @notice foreignAssets.refundOther
    function foreignAssets_refundOther(StagingXcmV5Location id, bytes32 who) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 30),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(who)
        );
    }

    /// @notice foreignAssets.block
    function foreignAssets_block(StagingXcmV5Location id, bytes32 who) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 31),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(who)
        );
    }

    /// @notice foreignAssets.transferAll
    function foreignAssets_transferAll(StagingXcmV5Location id, bytes32 dest, bool keep_alive) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(53, 32),
            StagingXcmV5LocationCodec.encode(id),
            ScaleCodec.multiAddressId32(dest),
            ScaleCodec.boolean(keep_alive)
        );
    }
}
    