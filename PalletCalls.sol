// Auto-generated from Westend Asset Hub (westmint v1018013)
pragma solidity ^0.8.24;

contract PalletCalls {
    enum Call {
        balances_transferAllowDeath,
        balances_forceTransfer,
        balances_transferKeepAlive,
        balances_transferAll,
        balances_forceUnreserve,
        balances_upgradeAccounts,
        balances_forceSetBalance,
        balances_forceAdjustTotalIssuance,
        balances_burn
    }

    function indices(Call c) public pure returns (uint8 palletIndex, uint8 callIndex) {
        if (false) {}
        else if (c == Call.balances_transferAllowDeath) return (10, 0); // balances.transferAllowDeath
        else if (c == Call.balances_forceTransfer) return (10, 2); // balances.forceTransfer
        else if (c == Call.balances_transferKeepAlive) return (10, 3); // balances.transferKeepAlive
        else if (c == Call.balances_transferAll) return (10, 4); // balances.transferAll
        else if (c == Call.balances_forceUnreserve) return (10, 5); // balances.forceUnreserve
        else if (c == Call.balances_upgradeAccounts) return (10, 6); // balances.upgradeAccounts
        else if (c == Call.balances_forceSetBalance) return (10, 8); // balances.forceSetBalance
        else if (c == Call.balances_forceAdjustTotalIssuance) return (10, 9); // balances.forceAdjustTotalIssuance
        else if (c == Call.balances_burn) return (10, 10); // balances.burn
        else revert("Unknown call");
    }
}
