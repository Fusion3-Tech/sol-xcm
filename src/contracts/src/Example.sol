// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ScaleCodec.sol";
import "./XcmBuilder.sol";
import "./IXCM.sol";

contract XcmExamples {
    IXcm xcmPrecompile = IXcm(XCM_PRECOMPILE_ADDRESS);
    XcmBuilderV3 public immutable Builder;

    constructor(XcmBuilderV3 builder) {
        Builder = builder;
    }

    /// @param destParaId            Destination parachain ID.
    /// @param beneficiaryAccountId  32-byte AccountId on destination.
    /// @param feeAssetOnThisChain   MultiLocation (SCALE) of the fee asset *from the sender’s context*.
    ///                              Examples:
    ///                               - Native relay asset: parents=0 and some interior (or parents=1 if asset lives on relay)
    ///                               - A para asset: parents=1 + X1(Parachain(…)) etc.
    /// @param feeAmount             Amount to withdraw & use for execution and (optionally) deposit.
    /// @param destOpaqueCall        SCALE-encoded call for the destination chain (pallet+call+args).
    /// @param refTime               Weight refTime hint (chain-specific).
    /// @param proofSize             Weight proofSize hint (chain-specific).
    function buildSimpleProgram(
        uint32 destParaId,
        bytes32 beneficiaryAccountId,
        bytes memory feeAssetOnThisChain,
        uint128 feeAmount,
        bytes memory destOpaqueCall,
        uint64 refTime,
        uint64 proofSize
    ) public returns (bytes memory versionedXcm) {
        // 1) Destination MultiLocation: parents=1 (up one to relay), X1(Parachain(destParaId))
        //    Adjust `parents` to your topology. If you’re already on the relay, parents=0.
        bytes memory destJ = Builder.jParachain(destParaId);
        bytes memory destInterior = Builder.interiorX1(destJ);
        bytes memory dest = Builder.multiLocation(1, destInterior); // relay->para

        // 2) Beneficiary MultiLocation (AccountId32 on dest): parents=0, X1(AccountId32)
        bytes memory bj = Builder.jAccountId32(beneficiaryAccountId);
        bytes memory bInterior = Builder.interiorX1(bj);
        bytes memory beneficiary = Builder.multiLocation(0, bInterior);
        bytes memory beneficiaryV = Builder.versionedMultiLocation(beneficiary);

        // 3) Assemble fee asset: MultiAsset(Concrete(feeAssetOnThisChain), Fungible(feeAmount))
        bytes memory feeId = Builder.assetIdConcrete(feeAssetOnThisChain);
        bytes memory feeMa = Builder.multiAssetConcreteFungible(feeId, feeAmount);

        // Vec<MultiAsset>[1] and VersionedMultiAssets
        bytes memory feeVec = Builder.vecMultiAsset(feeMa, 1);
        bytes memory assets = Builder.versionedMultiAssets(feeVec);

        // 4) Weight/limit
        bytes memory w = Builder.weight(refTime, proofSize);
        bytes memory wlim = Builder.weightLimitLimited(w);
        // If you prefer unlimited:
        // bytes memory wlim = Builder.weightLimitUnlimited();

        // 5) Build instructions
        bytes memory i1 = Builder.insWithdrawAsset(assets);
        bytes memory i2 = Builder.insBuyExecution(0, wlim);                    // use item 0 in `assets` as fee
        bytes memory i3 = Builder.insTransact(Builder.originKindNative(), destOpaqueCall, w);
        bytes memory i4 = Builder.insDepositAsset(assets, beneficiaryV, 1);
        bytes memory i5 = Builder.insClearOrigin();

        // 6) Vec<Instruction> + VersionedXcm
        bytes memory body = Builder.xcm(abi.encodePacked(i1, i2, i3, i4, i5), 5);
        versionedXcm = Builder.versionedXcm(body);

        IXcm.Weight memory weight = xcmPrecompile.weighMessage(versionedXcm);
        xcmPrecompile.execute(versionedXcm, weight);
    }

    /// Bonus: build a simple ReserveTransferAssets (common pattern when you just want to send funds)
    /// Sequence: WithdrawAsset -> BuyExecution -> DepositAsset (to dest account) -> ClearOrigin
    /// (No Transact step.)
    function buildSimpleReserveTransfer(
        bytes memory feeAssetOnThisChain,
        uint128 amount,
        bytes memory destMultiLocation, // e.g., parents=1 + X1(Parachain(…))
        bytes memory beneficiaryVML,    // VersionedMultiLocation(AccountId32 on dest)
        uint64 refTime,
        uint64 proofSize
    ) external view returns (bytes memory versionedXcm) {
        bytes memory feeId = Builder.assetIdConcrete(feeAssetOnThisChain);
        bytes memory ma    = Builder.multiAssetConcreteFungible(feeId, amount);
        bytes memory vecMA = Builder.vecMultiAsset(ma, 1);
        bytes memory assets = Builder.versionedMultiAssets(vecMA);

        bytes memory w = Builder.weight(refTime, proofSize);
        bytes memory wlim = Builder.weightLimitLimited(w);

        bytes memory i1 = Builder.insWithdrawAsset(assets);
        bytes memory i2 = Builder.insBuyExecution(0, wlim);
        bytes memory i3 = Builder.insDepositAsset(assets, beneficiaryVML, 1);
        bytes memory i4 = Builder.insClearOrigin();

        bytes memory body = Builder.xcm(abi.encodePacked(i1, i2, i3, i4), 4);
        versionedXcm = Builder.versionedXcm(body);
    }
}
