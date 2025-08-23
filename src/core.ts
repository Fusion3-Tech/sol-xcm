import { ApiPromise } from "@polkadot/api";
import { sanitize } from "./helpers";

type Entry = {
  enumName: string;
  section: string;
  method: string;
  palletIndex: number;
  callIndex: number;
};

export async function collectEntries(
  api: ApiPromise,
  palletsLower: string[]
): Promise<Entry[]> {
  const entries: Entry[] = [];

  for (const [section, sectionMethods] of Object.entries(api.tx)) {
    if (!palletsLower.includes(section.toLowerCase())) continue;

    for (const [method, extrinsic] of Object.entries(sectionMethods as any)) {
      // @ts-ignore polkadot-js: callIndex exists on tx functions
      if (!extrinsic || !extrinsic.meta || !("callIndex" in extrinsic)) continue;

      const [palletIndex, callIndex] = extrinsic.callIndex as Uint8Array;
      const enumName = sanitize(`${section}_${method}`);

      entries.push({
        enumName,
        section,
        method,
        palletIndex,
        callIndex,
      });
    }
  }

  entries.sort(
    (a, b) =>
      a.palletIndex - b.palletIndex ||
      a.callIndex - b.callIndex ||
      a.enumName.localeCompare(b.enumName)
  );

  return entries;
}

export function generateSolidity(opts: {
  chain: string;
  specName: string;
  specVersion: number;
  ws: string;
  contract: string;
  solc: string;
  entries: Entry[];
  palletsLower: string[];
}): string {
  const enumLines = opts.entries.map((e) => `        ${e.enumName}`).join(",\n");

  const caseLines = opts.entries
    .map(
      (e) =>
        `        else if (c == Call.${e.enumName}) return (${e.palletIndex}, ${e.callIndex}); // ${e.section}.${e.method}`
    )
    .join("\n");

  return `// Auto-generated from ${opts.chain} (${opts.specName} v${opts.specVersion})
// Source WS: ${opts.ws}
// Pallets: ${opts.palletsLower.join(", ")}
pragma solidity ^${opts.solc};

contract ${opts.contract} {
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
}

export function toJsonMap(entries: Entry[]) {
  // { [enumName]: [palletIndex, callIndex] }
  return Object.fromEntries(
    entries.map((e) => [e.enumName, [e.palletIndex, e.callIndex]])
  );
}
