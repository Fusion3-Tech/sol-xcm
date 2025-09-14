// Auto-generated from Westend Asset Hub (westmint v1020000)
// Source WS: wss://westend-asset-hub-rpc.polkadot.io
pragma solidity ^0.8.24;

import "./ScaleCodec.sol";
import "./CallEncoders.sol";

// Auto-generated from Substrate struct SpWeightsWeightV2Weight

struct SpWeightsWeightV2Weight {
    CompactU64 reftime;
    CompactU64 proofsize;
}

library SpWeightsWeightV2WeightCodec {
    // SCALE encode: concatenate field encodings in declaration order
    function encode(SpWeightsWeightV2Weight memory s) internal pure returns (bytes memory) {
        return abi.encodePacked(CompactU64Codec.encode(s.reftime), CompactU64Codec.encode(s.proofsize));
    }
}


/// @title Typed SCALE encoders for selected calls (supported classified args only)
library CallEncoders {
    /// @notice revive.ethTransact
    function revive_ethTransact(bytes memory payload) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(60, 0),
            ScaleCodec.vecU8(payload)
        );
    }

    /// @notice revive.call
    function revive_call(H160 dest, uint128 value, SpWeightsWeightV2Weight gas_limit, uint128 storage_deposit_limit, bytes memory data) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(60, 1),
            H160Codec.encode(dest),
            ScaleCodec.compactU128(value),
            SpWeightsWeightV2WeightCodec.encode(gas_limit),
            ScaleCodec.compactU128(storage_deposit_limit),
            ScaleCodec.vecU8(data)
        );
    }

    /// @notice revive.instantiate
    function revive_instantiate(uint128 value, SpWeightsWeightV2Weight gas_limit, uint128 storage_deposit_limit, H256 code_hash, bytes memory data, Option<[u8;32]> salt) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(60, 2),
            ScaleCodec.compactU128(value),
            SpWeightsWeightV2WeightCodec.encode(gas_limit),
            ScaleCodec.compactU128(storage_deposit_limit),
            H256Codec.encode(code_hash),
            ScaleCodec.vecU8(data),
            Option<[u8;32]>Codec.encode(salt)
        );
    }

    /// @notice revive.instantiateWithCode
    function revive_instantiateWithCode(uint128 value, SpWeightsWeightV2Weight gas_limit, uint128 storage_deposit_limit, bytes memory code, bytes memory data, Option<[u8;32]> salt) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(60, 3),
            ScaleCodec.compactU128(value),
            SpWeightsWeightV2WeightCodec.encode(gas_limit),
            ScaleCodec.compactU128(storage_deposit_limit),
            ScaleCodec.vecU8(code),
            ScaleCodec.vecU8(data),
            Option<[u8;32]>Codec.encode(salt)
        );
    }

    /// @notice revive.uploadCode
    function revive_uploadCode(bytes memory code, uint128 storage_deposit_limit) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(60, 4),
            ScaleCodec.vecU8(code),
            ScaleCodec.compactU128(storage_deposit_limit)
        );
    }

    /// @notice revive.removeCode
    function revive_removeCode(H256 code_hash) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(60, 5),
            H256Codec.encode(code_hash)
        );
    }

    /// @notice revive.setCode
    function revive_setCode(H160 dest, H256 code_hash) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(60, 6),
            H160Codec.encode(dest),
            H256Codec.encode(code_hash)
        );
    }

    /// @notice revive.mapAccount
    function revive_mapAccount() internal pure returns (bytes memory) {
        return ScaleCodec.callIndex(60, 7);
    }

    /// @notice revive.unmapAccount
    function revive_unmapAccount() internal pure returns (bytes memory) {
        return ScaleCodec.callIndex(60, 8);
    }

    /// @notice revive.dispatchAsFallbackAccount
    function revive_dispatchAsFallbackAccount(Call call) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(60, 9),
            CallCodec.encode(call)
        );
    }

    /// @notice revive.ethInstantiateWithCode
    function revive_ethInstantiateWithCode(U256 value, SpWeightsWeightV2Weight gas_limit, uint128 storage_deposit_limit, bytes memory code, bytes memory data) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(60, 10),
            U256Codec.encode(value),
            SpWeightsWeightV2WeightCodec.encode(gas_limit),
            ScaleCodec.compactU128(storage_deposit_limit),
            ScaleCodec.vecU8(code),
            ScaleCodec.vecU8(data)
        );
    }

    /// @notice revive.ethCall
    function revive_ethCall(H160 dest, U256 value, SpWeightsWeightV2Weight gas_limit, uint128 storage_deposit_limit, bytes memory data) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(60, 11),
            H160Codec.encode(dest),
            U256Codec.encode(value),
            SpWeightsWeightV2WeightCodec.encode(gas_limit),
            ScaleCodec.compactU128(storage_deposit_limit),
            ScaleCodec.vecU8(data)
        );
    }
}
    