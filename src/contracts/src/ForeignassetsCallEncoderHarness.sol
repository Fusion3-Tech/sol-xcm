// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../../../contracts/ForeignassetsCallEncoder.sol";

contract ForeignassetsCallEncoderHarness {
    /// @notice foreignAssets.create
    function foreignAssets_create(StagingXcmV5Location memory id, bytes32 admin, uint128 min_balance) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_create(id, admin, min_balance);
    }

    /// @notice foreignAssets.forceCreate
    function foreignAssets_forceCreate(StagingXcmV5Location memory id, bytes32 owner, bool is_sufficient, uint128 min_balance) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_forceCreate(id, owner, is_sufficient, min_balance);
    }

    /// @notice foreignAssets.startDestroy
    function foreignAssets_startDestroy(StagingXcmV5Location memory id) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_startDestroy(id);
    }

    /// @notice foreignAssets.destroyAccounts
    function foreignAssets_destroyAccounts(StagingXcmV5Location memory id) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_destroyAccounts(id);
    }

    /// @notice foreignAssets.destroyApprovals
    function foreignAssets_destroyApprovals(StagingXcmV5Location memory id) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_destroyApprovals(id);
    }

    /// @notice foreignAssets.finishDestroy
    function foreignAssets_finishDestroy(StagingXcmV5Location memory id) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_finishDestroy(id);
    }

    /// @notice foreignAssets.mint
    function foreignAssets_mint(StagingXcmV5Location memory id, bytes32 beneficiary, uint128 amount) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_mint(id, beneficiary, amount);
    }

    /// @notice foreignAssets.burn
    function foreignAssets_burn(StagingXcmV5Location memory id, bytes32 who, uint128 amount) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_burn(id, who, amount);
    }

    /// @notice foreignAssets.transfer
    function foreignAssets_transfer(StagingXcmV5Location memory id, bytes32 target, uint128 amount) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_transfer(id, target, amount);
    }

    /// @notice foreignAssets.transferKeepAlive
    function foreignAssets_transferKeepAlive(StagingXcmV5Location memory id, bytes32 target, uint128 amount) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_transferKeepAlive(id, target, amount);
    }

    /// @notice foreignAssets.forceTransfer
    function foreignAssets_forceTransfer(StagingXcmV5Location memory id, bytes32 source, bytes32 dest, uint128 amount) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_forceTransfer(id, source, dest, amount);
    }

    /// @notice foreignAssets.freeze
    function foreignAssets_freeze(StagingXcmV5Location memory id, bytes32 who) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_freeze(id, who);
    }

    /// @notice foreignAssets.thaw
    function foreignAssets_thaw(StagingXcmV5Location memory id, bytes32 who) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_thaw(id, who);
    }

    /// @notice foreignAssets.freezeAsset
    function foreignAssets_freezeAsset(StagingXcmV5Location memory id) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_freezeAsset(id);
    }

    /// @notice foreignAssets.thawAsset
    function foreignAssets_thawAsset(StagingXcmV5Location memory id) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_thawAsset(id);
    }

    /// @notice foreignAssets.transferOwnership
    function foreignAssets_transferOwnership(StagingXcmV5Location memory id, bytes32 owner) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_transferOwnership(id, owner);
    }

    /// @notice foreignAssets.setTeam
    function foreignAssets_setTeam(StagingXcmV5Location memory id, bytes32 issuer, bytes32 admin, bytes32 freezer) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_setTeam(id, issuer, admin, freezer);
    }

    /// @notice foreignAssets.setMetadata
    function foreignAssets_setMetadata(StagingXcmV5Location memory id, bytes memory name, bytes memory symbol, uint8 decimals) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_setMetadata(id, name, symbol, decimals);
    }

    /// @notice foreignAssets.clearMetadata
    function foreignAssets_clearMetadata(StagingXcmV5Location memory id) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_clearMetadata(id);
    }

    /// @notice foreignAssets.forceSetMetadata
    function foreignAssets_forceSetMetadata(StagingXcmV5Location memory id, bytes memory name, bytes memory symbol, uint8 decimals, bool is_frozen) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_forceSetMetadata(id, name, symbol, decimals, is_frozen);
    }

    /// @notice foreignAssets.forceClearMetadata
    function foreignAssets_forceClearMetadata(StagingXcmV5Location memory id) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_forceClearMetadata(id);
    }

    /// @notice foreignAssets.forceAssetStatus
    function foreignAssets_forceAssetStatus(
        StagingXcmV5Location memory id,
        bytes32 owner,
        bytes32 issuer,
        bytes32 admin,
        bytes32 freezer,
        uint128 min_balance,
        bool is_sufficient,
        bool is_frozen
    ) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_forceAssetStatus(id, owner, issuer, admin, freezer, min_balance, is_sufficient, is_frozen);
    }

    /// @notice foreignAssets.approveTransfer
    function foreignAssets_approveTransfer(StagingXcmV5Location memory id, bytes32 delegate, uint128 amount) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_approveTransfer(id, delegate, amount);
    }

    /// @notice foreignAssets.cancelApproval
    function foreignAssets_cancelApproval(StagingXcmV5Location memory id, bytes32 delegate) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_cancelApproval(id, delegate);
    }

    /// @notice foreignAssets.forceCancelApproval
    function foreignAssets_forceCancelApproval(StagingXcmV5Location memory id, bytes32 owner, bytes32 delegate) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_forceCancelApproval(id, owner, delegate);
    }

    /// @notice foreignAssets.transferApproved
    function foreignAssets_transferApproved(StagingXcmV5Location memory id, bytes32 owner, bytes32 destination, uint128 amount) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_transferApproved(id, owner, destination, amount);
    }

    /// @notice foreignAssets.touch
    function foreignAssets_touch(StagingXcmV5Location memory id) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_touch(id);
    }

    /// @notice foreignAssets.refund
    function foreignAssets_refund(StagingXcmV5Location memory id, bool allow_burn) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_refund(id, allow_burn);
    }

    /// @notice foreignAssets.setMinBalance
    function foreignAssets_setMinBalance(StagingXcmV5Location memory id, uint128 min_balance) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_setMinBalance(id, min_balance);
    }

    /// @notice foreignAssets.touchOther
    function foreignAssets_touchOther(StagingXcmV5Location memory id, bytes32 who) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_touchOther(id, who);
    }

    /// @notice foreignAssets.refundOther
    function foreignAssets_refundOther(StagingXcmV5Location memory id, bytes32 who) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_refundOther(id, who);
    }

    /// @notice foreignAssets.block
    function foreignAssets_block(StagingXcmV5Location memory id, bytes32 who) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_block(id, who);
    }

    /// @notice foreignAssets.transferAll
    function foreignAssets_transferAll(StagingXcmV5Location memory id, bytes32 dest, bool keep_alive) external pure returns (bytes memory) {
        return ForeignassetsCallEncoder.foreignAssets_transferAll(id, dest, keep_alive);
    }
}