// Auto-generated from Westend Asset Hub (westmint v1018013)
// Source WS: wss://westend-asset-hub-rpc.polkadot.io
pragma solidity ^0.8.24;

import "./ScaleCodec.sol";
import "./CallEncoders.sol";

/// @title Typed SCALE encoders for selected calls (supported arg kinds only)
library CallEncoders {
    // Skipped balances.transferAllowDeath: unsupported arg types: dest:AccountIdLookupOf, value:Balance

    // Skipped balances.forceTransfer: unsupported arg types: source:AccountIdLookupOf, dest:AccountIdLookupOf, value:Balance

    // Skipped balances.transferKeepAlive: unsupported arg types: dest:AccountIdLookupOf, value:Balance

    // Skipped balances.transferAll: unsupported arg types: dest:AccountIdLookupOf, keepAlive:bool

    // Skipped balances.forceUnreserve: unsupported arg types: who:AccountIdLookupOf, amount:Balance

    // Skipped balances.upgradeAccounts: unsupported arg types: who:Vec<AccountId>

    // Skipped balances.forceSetBalance: unsupported arg types: who:AccountIdLookupOf, newFree:Balance

    // Skipped balances.forceAdjustTotalIssuance: unsupported arg types: direction:AdjustmentDirection, delta:Balance

    /// @notice balances.burn
    function balances_burn(uint128 value, bool keepAlive) internal pure returns (bytes memory) {
        return bytes.concat(
            ScaleCodec.callIndex(10, 10),
            ScaleCodec.u128LE(value),
            ScaleCodec.boolean(keepAlive)
        );
    }
}
    