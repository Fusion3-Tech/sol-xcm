import { ApiPromise, WsProvider } from '@polkadot/api';
import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';

const sanitize = (s: string) => s.replace(/[^A-Za-z0-9_]/g, '_');

type Entry = {
  enumName: string;
  section: string;
  method: string;
  palletIndex: number;
  callIndex: number;
  args: Array<{ name: string; typeStr: string; kind: ParamKind }>;
};

type ParamKind =
  | 'MultiAddressId32'
  | 'AccountId32'
  | 'CompactU128'
  | 'CompactU32'
  | 'U8'
  | 'U16'
  | 'U32'
  | 'U64'
  | 'U128'
  | 'Bytes'
  | 'Bool'
  | 'Unsupported';

function classifyType(typeStrRaw: string): ParamKind {
  const t = typeStrRaw.replace(/\s/g, '').toLowerCase();

  // Common first: MultiAddress
  if (t.includes('multiaddress')) return 'MultiAddressId32'; // we encode Id(AccountId32) variant
  if (t.includes('accountid32') || t === 'accountid') return 'AccountId32';

  // Compact<...>
  if (t.startsWith('compact<')) {
    if (t.includes('u128') || t.includes('balance')) return 'CompactU128';
    if (t.includes('u32')) return 'CompactU32';
  }

  // Primitives / aliases frequently seen
  if (t === 'bool') return 'Bool';
  if (t === 'u8') return 'U8';
  if (t === 'u16') return 'U16';
  if (t === 'u32') return 'U32';
  if (t === 'u64') return 'U64';
  if (t === 'u128' || t.endsWith('balance')) return 'U128';

  // Bytes/Vec<u8>
  if (t === 'bytes' || t === 'vec<u8>' || t.includes('boundedvec<u8')) return 'Bytes';

  return 'Unsupported';
}

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (dir && dir !== '.') fs.mkdirSync(dir, { recursive: true });
}

const program = new Command()
  .option('--ws <url>', 'WebSocket endpoint', 'wss://westend-asset-hub-rpc.polkadot.io')
  .option('--out-dir <dir>', 'Output contracts directory', 'contracts')
  .option('--contract <name>', 'Indices contract name', 'PalletCalls')
  .option('--encoders <name>', 'Encoders library name', 'CallEncoders')
  .argument('<pallets...>', 'Pallet names to include (e.g. Balances System)');

// decide on a readable type string for an arg
function resolveTypeStr(api: ApiPromise, arg: any): string {
  // Prefer explicit typeName if present in metadata
  const tn = arg.typeName?.toString();
  if (tn && tn !== '') return tn;

  const raw = arg.type?.toString?.() ?? String(arg.type);

  // Lookup id if it's purely numeric or already a "Lookup..." marker
  const isLookupLike = /^\d+$/.test(raw) || raw.startsWith('Lookup');
  if (isLookupLike) {
    const def = api.registry.lookup.getTypeDef(arg.type);
    // Use a nice name if available, otherwise the raw def.type
    return (def.lookupName || def.type || raw).toString();
  }

  // Concrete type like "Bytes", "Vec<u8>", "Balance"
  return raw;
}

async function main() {
  const parsed = program.parse(process.argv);
  const opts = parsed.opts<{
    ws: string;
    outDir: string;
    contract: string;
    encoders: string;
  }>();
  const pallets = (parsed.args as string[]).map((x) => x.toLowerCase());

  if (!pallets.length) {
    program.error('Provide at least one pallet.');
  }

  const api = await ApiPromise.create({ provider: new WsProvider(opts.ws) });
  try {
    const chain = (await api.rpc.system.chain()).toString();
    const specName = api.runtimeVersion.specName.toString();
    const specVersion = api.runtimeVersion.specVersion.toNumber();

    const entries: Entry[] = [];

    for (const [section, sectionMethods] of Object.entries(api.tx)) {
      if (!pallets.includes(section.toLowerCase())) continue;
      for (const [method, extrinsic] of Object.entries(sectionMethods as any)) {
        // @ts-ignore
        if (!extrinsic || !extrinsic.meta || !('callIndex' in extrinsic)) continue;
        const [palletIndex, callIndex] = extrinsic.callIndex as Uint8Array;

        // gather arg info
        // @ts-ignore
        const metaArgs = extrinsic.meta.args as Array<{ name: any; type: any; typeName?: any }>;
        const args = metaArgs.map((a) => {
          const name = a.name.toString();
          const typeStr = resolveTypeStr(api, a);
          return { name, typeStr, kind: classifyType(typeStr) };
        });

        entries.push({
          enumName: sanitize(`${section}_${method}`),
          section,
          method,
          palletIndex,
          callIndex,
          args,
        });
      }
    }

    if (!entries.length) {
      console.error('❌ No matching calls found.');
      process.exit(1);
    }

    entries.sort(
      (a, b) =>
        a.palletIndex - b.palletIndex ||
        a.callIndex - b.callIndex ||
        a.enumName.localeCompare(b.enumName),
    );

    // --- PalletCalls.sol (indices) ---
    const enumLines = entries.map((e) => `        ${e.enumName}`).join(',\n');
    const caseLines = entries
      .map(
        (e) =>
          `        else if (c == Call.${e.enumName}) return (${e.palletIndex}, ${e.callIndex}); // ${e.section}.${e.method}`,
      )
      .join('\n');

    const palletCalls = `// Auto-generated from ${chain} (${specName} v${specVersion})
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

    // --- CallEncoders.sol (typed encoders for supported calls) ---
    function solTypeAndEncoder(k: ParamKind, paramName: string): { sol: string; enc: string } | null {
      // map supported kinds to (sol_type, encoder_call)
      if (k === 'MultiAddressId32') return { sol: 'bytes32', enc: `ScaleCodec.multiAddressId32(${paramName})` };
      if (k === 'AccountId32') return { sol: 'bytes32', enc: `ScaleCodec.u128LE(uint128(uint256(${paramName})))` }; // rarely used directly; adjust as needed
      if (k === 'CompactU128') return { sol: 'uint128', enc: `ScaleCodec.compactU128(${paramName})` };
      if (k === 'CompactU32') return { sol: 'uint32', enc: `ScaleCodec.compactU32(${paramName})` };
      if (k === 'U8') return { sol: 'uint8', enc: `ScaleCodec.u8(${paramName})` };
      if (k === 'U16') return { sol: 'uint16', enc: `ScaleCodec.u16LE(${paramName})` };
      if (k === 'U32') return { sol: 'uint32', enc: `ScaleCodec.u32LE(${paramName})` };
      if (k === 'U64') return { sol: 'uint64', enc: `ScaleCodec.u64LE(${paramName})` };
      if (k === 'U128') return { sol: 'uint128', enc: `ScaleCodec.u128LE(${paramName})` };
      if (k === 'Bytes') return { sol: 'bytes memory', enc: `ScaleCodec.vecU8(${paramName})` };
      if (k === 'Bool') return { sol: 'bool', enc: `ScaleCodec.boolean(${paramName})` };
      return null;
    }

    function makeFnName(e: Entry): string {
      // e.g. balances_transferKeepAlive_id32 when first arg is MultiAddressId32
      const suffix =
        e.args.length && e.args[0].kind === 'MultiAddressId32' ? '_id32' : '';
      return `${e.section}_${e.method}${suffix}`;
    }

    const encoderFns: string[] = [];
    for (const e of entries) {
      const pieces: string[] = [];
      const params: string[] = [];

      let supported = true;
      e.args.forEach((a, idx) => {
        const mapped = solTypeAndEncoder(a.kind, sanitize(a.name));
        if (!mapped) supported = false;
        else {
          params.push(`${mapped.sol} ${sanitize(a.name)}`);
          pieces.push(mapped.enc);
        }
      });

      if (!supported) {
        encoderFns.push(
          `    // Skipped ${e.section}.${e.method}: unsupported arg types: ${e.args
            .map((a) => `${a.name}:${a.typeStr}`)
            .join(', ')}`,
        );
        continue;
      }

      const fname = makeFnName(e);
      const body = pieces.length
        ? `bytes.concat(
            ScaleCodec.callIndex(${e.palletIndex}, ${e.callIndex}),
            ${pieces.join(',\n            ')}
        )`
        : `ScaleCodec.callIndex(${e.palletIndex}, ${e.callIndex})`;

      encoderFns.push(
        `    /// @notice ${e.section}.${e.method}
    function ${fname}(${params.join(', ')}) internal pure returns (bytes memory) {
        return ${body};
    }`,
      );
    }

    const callEncoders = `// Auto-generated from ${chain} (${specName} v${specVersion})
// Source WS: ${opts.ws}
pragma solidity ^0.8.24;

import "./ScaleCodec.sol";
import "./${sanitize(opts.contract)}.sol";

/// @title Typed SCALE encoders for selected calls (supported arg kinds only)
library ${sanitize(opts.encoders)} {
${encoderFns.join('\n\n')}
}
`;

    // write files
    const indicesPath = path.join(opts.outDir, `${sanitize(opts.contract)}.sol`);
    const encodersPath = path.join(opts.outDir, `${sanitize(opts.encoders)}.sol`);
    ensureDir(indicesPath);
    ensureDir(encodersPath);
    fs.writeFileSync(indicesPath, palletCalls);
    fs.writeFileSync(encodersPath, callEncoders);

    console.log(`✅ Wrote:
 - ${indicesPath}
 - ${encodersPath}
(remember to place contracts/ScaleCodec.sol alongside)`);

  } finally {
    await api.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
