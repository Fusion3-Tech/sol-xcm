// Auto-generated from Westend Asset Hub (westmint v1018013)
// Source WS: wss://westend-asset-hub-rpc.polkadot.io
pragma solidity ^0.8.24;

contract PalletCalls {
    enum Call {
        system_remark,
        system_setHeapPages,
        system_setCode,
        system_setCodeWithoutChecks,
        system_setStorage,
        system_killStorage,
        system_killPrefix,
        system_remarkWithEvent,
        system_authorizeUpgrade,
        system_authorizeUpgradeWithoutChecks,
        system_applyAuthorizedUpgrade
    }

    function indices(Call c) public pure returns (uint8 palletIndex, uint8 callIndex) {
        if (false) {}
        else if (c == Call.system_remark) return (0, 0); // system.remark
        else if (c == Call.system_setHeapPages) return (0, 1); // system.setHeapPages
        else if (c == Call.system_setCode) return (0, 2); // system.setCode
        else if (c == Call.system_setCodeWithoutChecks) return (0, 3); // system.setCodeWithoutChecks
        else if (c == Call.system_setStorage) return (0, 4); // system.setStorage
        else if (c == Call.system_killStorage) return (0, 5); // system.killStorage
        else if (c == Call.system_killPrefix) return (0, 6); // system.killPrefix
        else if (c == Call.system_remarkWithEvent) return (0, 7); // system.remarkWithEvent
        else if (c == Call.system_authorizeUpgrade) return (0, 9); // system.authorizeUpgrade
        else if (c == Call.system_authorizeUpgradeWithoutChecks) return (0, 10); // system.authorizeUpgradeWithoutChecks
        else if (c == Call.system_applyAuthorizedUpgrade) return (0, 11); // system.applyAuthorizedUpgrade
        else revert("Unknown call");
    }
}
    