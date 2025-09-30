// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ScaleCodec.sol";

interface IXcmBuilder {
    // Junctions & multilocation
    function interiorHere() external pure returns (bytes memory);
    function jParachain(uint32 paraId) external view returns (bytes memory);
    function jAccountId32(bytes32 id) external view returns (bytes memory);
    function jAccountKey20(bytes20 key) external view returns (bytes memory);
    function jPalletInstance(uint8 index) external view returns (bytes memory);
    function jGeneralIndex(uint128 index) external view returns (bytes memory);

    function interiorX1(bytes calldata j1) external view returns (bytes memory);
    function interiorX2(bytes calldata j1, bytes calldata j2) external view returns (bytes memory);
    function interiorX3(bytes calldata j1, bytes calldata j2, bytes calldata j3) external view returns (bytes memory);

    function multiLocation(uint8 parents, bytes calldata interior) external view returns (bytes memory);

    // Assets
    function assetIdConcrete(bytes calldata multiLocationEncoded) external view returns (bytes memory);
    function fungible(uint128 amount) external view returns (bytes memory);
    function multiAssetConcreteFungible(bytes calldata assetIdConcreteEncoded, uint128 amount) external view returns (bytes memory);
    function versionedMultiAssets(bytes calldata vecMultiAsset) external pure returns (bytes memory);
    function vecMultiAsset(bytes calldata concatenated, uint256 count) external view returns (bytes memory);

    // Weight
    function weight(uint64 refTime, uint64 proofSize) external view returns (bytes memory);
    function weightLimitLimited(bytes calldata weightEncoded) external pure returns (bytes memory);
    function weightLimitUnlimited() external pure returns (bytes memory);

    // Origin kind
    function originKindNative() external pure returns (bytes memory);

    // Dest / Beneficiary wrappers
    function versionedMultiLocation(bytes calldata multiLocationEncoded) external pure returns (bytes memory);

    // Instructions
    function insWithdrawAsset(bytes calldata versionedMultiAssetsEncoded) external pure returns (bytes memory);
    function insBuyExecution(uint32 feeAssetItem, bytes calldata weightLimitEncoded) external view returns (bytes memory);
    function insTransact(bytes calldata originKindEncoded, bytes calldata call, bytes calldata weightEncoded) external pure returns (bytes memory);
    function insDepositAsset(bytes calldata versionedMultiAssetsEncoded, bytes calldata beneficiaryVersionedMultiLocationEncoded, uint32 maxAssets) external view returns (bytes memory);
    function insClearOrigin() external pure returns (bytes memory);

    // XCM wrapper
    function xcm(bytes calldata concatenatedInstructions, uint256 count) external view returns (bytes memory);
    function versionedXcm(bytes calldata xcmEncoded) external pure returns (bytes memory);
}

contract XcmBuilderV3 is IXcmBuilder {
    IScaleCodec private immutable S;

    /* ===== Fixed tags for XCM v3 =====
       (These match commonly-used Polkadot/Kusama XCM v3 layouts.) */
    uint8 private constant TAG_VersionedXcm_V3            = 3;
    uint8 private constant TAG_VersionedMultiAssets_V3    = 3;
    uint8 private constant TAG_VersionedMultiLocation_V3  = 3;

    // Junction
    uint8 private constant TAG_Junction_Parachain         = 0;
    uint8 private constant TAG_Junction_AccountId32       = 3;
    uint8 private constant TAG_Junction_AccountKey20      = 4;
    uint8 private constant TAG_Junction_PalletInstance    = 5;
    uint8 private constant TAG_Junction_GeneralIndex      = 6;

    // NetworkId
    uint8 private constant TAG_NetworkId_Any              = 0;

    // Junctions
    uint8 private constant TAG_Junctions_Here             = 0;
    uint8 private constant TAG_Junctions_X1               = 1;
    uint8 private constant TAG_Junctions_X2               = 2;
    uint8 private constant TAG_Junctions_X3               = 3;

    // AssetId
    uint8 private constant TAG_AssetId_Concrete           = 0;

    // Fungibility
    uint8 private constant TAG_Fungibility_Fungible       = 0;

    // WeightLimit
    uint8 private constant TAG_WeightLimit_Unlimited      = 0;
    uint8 private constant TAG_WeightLimit_Limited        = 1;

    // OriginKind (chain-dependent; v3 typical)
    uint8 private constant TAG_OriginKind_Native          = 0;

    // Instruction
    uint8 private constant TAG_Instruction_WithdrawAsset  = 0;
    uint8 private constant TAG_Instruction_BuyExecution   = 1;
    uint8 private constant TAG_Instruction_Transact       = 4;
    uint8 private constant TAG_Instruction_DepositAsset   = 8;
    uint8 private constant TAG_Instruction_ClearOrigin    = 9;

    constructor(IScaleCodec scaleCodec) {
        S = scaleCodec;
    }

    /* ===== private helpers ===== */

    function _enum1(uint8 tag, bytes memory payload) private pure returns (bytes memory) {
        return abi.encodePacked(bytes1(tag), payload);
    }

    function _vec(bytes memory concatenated, uint256 count) private view returns (bytes memory) {
        return abi.encodePacked(S.compactUint(count), concatenated);
    }

    /* ===== Junctions & MultiLocation ===== */

    function interiorHere() external pure returns (bytes memory) {
        // Caller must wrap with Junctions::Here tag where needed; interiorHere() payload is empty.
        return ""; // payload for Here is empty; tag applied by caller when needed.
    }

    function jParachain(uint32 paraId) external view returns (bytes memory) {
        return _enum1(TAG_Junction_Parachain, S.u32(paraId));
    }

    function jAccountId32(bytes32 id) external view returns (bytes memory) {
        bytes memory network = _enum1(TAG_NetworkId_Any, "");
        return _enum1(TAG_Junction_AccountId32, abi.encodePacked(network, id));
    }

    function jAccountKey20(bytes20 key) external view returns (bytes memory) {
        bytes memory network = _enum1(TAG_NetworkId_Any, "");
        return _enum1(TAG_Junction_AccountKey20, abi.encodePacked(network, key));
    }

    function jPalletInstance(uint8 index) external view returns (bytes memory) {
        return _enum1(TAG_Junction_PalletInstance, S.u8(index));
    }

    function jGeneralIndex(uint128 index) external view returns (bytes memory) {
        return _enum1(TAG_Junction_GeneralIndex, S.u128(index));
    }

    function interiorX1(bytes calldata j1) external view returns (bytes memory) {
        return _enum1(TAG_Junctions_X1, j1);
    }

    function interiorX2(bytes calldata j1, bytes calldata j2) external view returns (bytes memory) {
        return _enum1(TAG_Junctions_X2, abi.encodePacked(j1, j2));
    }

    function interiorX3(bytes calldata j1, bytes calldata j2, bytes calldata j3) external view returns (bytes memory) {
        return _enum1(TAG_Junctions_X3, abi.encodePacked(j1, j2, j3));
    }

    function multiLocation(uint8 parents, bytes calldata interior) external view returns (bytes memory) {
        // MultiLocation { parents: u8, interior: Junctions }
        return abi.encodePacked(S.u8(parents), interior);
    }

    /* ===== Assets ===== */

    function assetIdConcrete(bytes calldata multiLocationEncoded) external view returns (bytes memory) {
        return _enum1(TAG_AssetId_Concrete, multiLocationEncoded);
    }

    function fungible(uint128 amount) external view returns (bytes memory) {
        return _enum1(TAG_Fungibility_Fungible, S.u128(amount));
    }

    function multiAssetConcreteFungible(bytes calldata assetIdConcreteEncoded, uint128 amount) external view returns (bytes memory) {
        return abi.encodePacked(assetIdConcreteEncoded, _enum1(TAG_Fungibility_Fungible, S.u128(amount)));
    }

    function vecMultiAsset(bytes calldata concatenated, uint256 count) external view returns (bytes memory) {
        return _vec(concatenated, count);
    }

    function versionedMultiAssets(bytes calldata vecMultiAsset_) external pure returns (bytes memory) {
        return _enum1(TAG_VersionedMultiAssets_V3, vecMultiAsset_);
    }

    /* ===== Weight / WeightLimit ===== */

    function weight(uint64 refTime, uint64 proofSize) external view returns (bytes memory) {
        return abi.encodePacked(S.u64(refTime), S.u64(proofSize));
    }

    function weightLimitLimited(bytes calldata weightEncoded) external pure returns (bytes memory) {
        return _enum1(TAG_WeightLimit_Limited, weightEncoded);
    }

    function weightLimitUnlimited() external pure returns (bytes memory) {
        return _enum1(TAG_WeightLimit_Unlimited, "");
    }

    /* ===== OriginKind ===== */

    function originKindNative() external pure returns (bytes memory) {
        return _enum1(TAG_OriginKind_Native, "");
    }

    /* ===== Dest / Beneficiary wrappers ===== */

    function versionedMultiLocation(bytes calldata multiLocationEncoded) external pure returns (bytes memory) {
        return _enum1(TAG_VersionedMultiLocation_V3, multiLocationEncoded);
    }

    /* ===== Instructions ===== */

    function insWithdrawAsset(bytes calldata versionedMultiAssetsEncoded) external pure returns (bytes memory) {
        return _enum1(TAG_Instruction_WithdrawAsset, versionedMultiAssetsEncoded);
    }

    function insBuyExecution(uint32 feeAssetItem, bytes calldata weightLimitEncoded) external view returns (bytes memory) {
        return _enum1(TAG_Instruction_BuyExecution, abi.encodePacked(S.u32(feeAssetItem), weightLimitEncoded));
    }

    function insTransact(bytes calldata originKindEncoded, bytes calldata call, bytes calldata weightEncoded) external pure returns (bytes memory) {
        return _enum1(TAG_Instruction_Transact, abi.encodePacked(originKindEncoded, call, weightEncoded));
    }

    function insDepositAsset(bytes calldata versionedMultiAssetsEncoded, bytes calldata beneficiaryVersionedMultiLocationEncoded, uint32 maxAssets) external view returns (bytes memory) {
        return _enum1(
            TAG_Instruction_DepositAsset,
            abi.encodePacked(versionedMultiAssetsEncoded, beneficiaryVersionedMultiLocationEncoded, S.u32(maxAssets))
        );
    }

    function insClearOrigin() external pure returns (bytes memory) {
        return _enum1(TAG_Instruction_ClearOrigin, "");
    }

    /* ===== XCM wrapper ===== */

    function xcm(bytes calldata concatenatedInstructions, uint256 count) external view returns (bytes memory) {
        return _vec(concatenatedInstructions, count);
    }

    function versionedXcm(bytes calldata xcmEncoded) external pure returns (bytes memory) {
        return _enum1(TAG_VersionedXcm_V3, xcmEncoded);
    }
}
