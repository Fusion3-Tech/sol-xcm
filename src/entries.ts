import { type ApiPromise } from '@polkadot/api';

import { sanitize } from './helpers';

export type Entry = {
  enumName: string;
  section: string;
  method: string;
  palletIndex: number;
  callIndex: number;
  args: Array<{ name: string; typeStr: string; kind: ParamKind }>;
};

export type ParamKind =
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

type CallArg = {
  name: string;
  type: any;
};

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

// decide on a readable type string for an arg
function resolveTypeStr(api: ApiPromise, arg: CallArg): string {
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

export async function getEntries(api: ApiPromise, pallets: string[]): Promise<Entry[]> {
  const entries: Entry[] = [];

  for (const [section, sectionMethods] of Object.entries(api.tx)) {
    if (!pallets.includes(section.toLowerCase())) continue;
    for (const [method, extrinsic] of Object.entries(sectionMethods)) {
      // @ts-ignore
      if (!extrinsic || !extrinsic.meta || !('callIndex' in extrinsic)) continue;
      const [palletIndex, callIndex] = extrinsic.callIndex as Uint8Array;

      // gather arg info
      // @ts-ignore
      const metaArgs = extrinsic.meta.args;
      const args = metaArgs.map((a) => {
        const name = a.name.toString();
        const typeStr = resolveTypeStr(api, { name: a.name.toString(), type: a.type });
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

  return entries;
}
