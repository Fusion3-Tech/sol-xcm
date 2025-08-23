import { ApiPromise } from "@polkadot/api";
import { Entry } from "./entries";
import { sanitize } from "./helpers";
import { Opts } from "./cli";

export async function getCallsContract(api: ApiPromise, opts: Opts, entries: Entry[]): Promise<string> {
    const chain = (await api.rpc.system.chain()).toString();
    const specName = api.runtimeVersion.specName.toString();
    const specVersion = api.runtimeVersion.specVersion.toNumber();

    const enumLines = entries.map((e) => `        ${e.enumName}`).join(',\n');
    const caseLines = entries
      .map(
        (e) =>
          `        else if (c == Call.${e.enumName}) return (${e.palletIndex}, ${e.callIndex}); // ${e.section}.${e.method}`,
      )
      .join('\n');
    const callsContract = `// Auto-generated from ${chain} (${specName} v${specVersion})
// Source WS: ${opts.ws}
pragma solidity ^0.8.24;

contract ${sanitize(opts.contract)} {
    enum Call {
${enumLines}
    }

    function indices(Call c) public pure returns (uint8 palletIndex, uint8 callIndex) {
        if (false) {}
${caseLines}
        else revert("Unknown call");
    }
}
    `;

    return callsContract; 
}
