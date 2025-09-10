import { type ApiPromise } from '@polkadot/api';
import { TypeDefInfo } from '@polkadot/types-create';

import { sanitize } from './helpers';
import { TypeDef } from '@polkadot/types-create/types';

export type Entry = {
  enumName: string;
  section: string;
  method: string;
  palletIndex: number;
  callIndex: number;
  args: ArgDesc[];
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
  | 'EnumUnit'
  | 'EnumData'
  | 'Option'
  | 'Unsupported';

export type EnumInfoUnit = {
  kind: 'EnumUnit';
  rustName: string;
  solName: string;
  variants: string[]; // index is the SCALE tag
};

export type EnumField = {
  name?: string;          // present for struct-like variants
  typeStr: string;        // resolved, friendly
};

export type EnumInfoData = {
  kind: 'EnumData';
  rustName: string;
  solName: string;
  variants: Array<{
    name: string;
    fields: EnumField[];  // empty => unit variant
  }>;
};

export type DiscoveredEnum = EnumInfoUnit | EnumInfoData;

export type ArgDesc = {
  name: string;
  typeStr: string;
  kind: ParamKind;
  enumInfo?: DiscoveredEnum;
};

function isLookupLike(raw: string) {
  return /^\d+$/.test(raw) || raw.startsWith('Lookup');
}

function friendlyType(def: TypeDef): string {
  return (def.lookupName || def.type || 'Unknown').toString();
}

function toEnumInfo(typeStr: string, variants: string[]) {
  const base = (typeStr || 'Enum');
  const solName = sanitize(base);
  return { rustName: base, solName, variants };
}

export function resolveTypeStr(api: ApiPromise, arg: any): string {
  const raw = arg.type?.toString?.() ?? String(arg.type);
  if (isLookupLike(raw)) {
    console.log('lookup like'); // never lookup like
    const def = api.registry.lookup.getTypeDef(arg.type);
    return friendlyType(def);
  }
  return raw;
}

// Try to get a TypeDef for the arg (only if lookup-like)
function getTypeDefIfLookup(api: ApiPromise, arg: any): TypeDef | null {
  const raw = arg.type?.toString?.() ?? String(arg.type);
  if (!isLookupLike(raw)) return null;
  return api.registry.lookup.getTypeDef(arg.type);
}

// Extract enum details from a TypeDef, handling unit/tuple/struct variants
function enumFromTypeDef(def: TypeDef): DiscoveredEnum | null {
  if (def.info !== TypeDefInfo.Enum || !Array.isArray(def.sub)) return null;

  const subs = def.sub as TypeDef[]; // one entry per variant; has .name and its own .info/.sub

  // Is it purely unit variants?
  const unitOnly = subs.every((v) =>
    v.info === TypeDefInfo.Null ||
    (typeof v.type === 'string' && v.type.toLowerCase() === 'null') ||
    v.sub == null // nothing nested
  );

  const rustName = friendlyType(def);
  const solName = sanitize(rustName);

  if (unitOnly) {
    const variants = subs.map((v) => (v.name || '').toString());
    return { kind: 'EnumUnit', rustName, solName, variants };
  }

  // Data-carrying variants: tuple/struct
  const variants = subs.map((v) => {
    const vName = (v.name || '').toString();

    // Tuple variant: v.info === Tuple with v.sub: TypeDef[]
    if (v.info === TypeDefInfo.Tuple && Array.isArray(v.sub)) {
      const fields = (v.sub as TypeDef[]).map((fd) => ({
        typeStr: friendlyType(fd),
      }));
      return { name: vName, fields };
    }

    // Struct variant: v.info === Struct with v.sub: TypeDef[] (with .name)
    if (v.info === TypeDefInfo.Struct && Array.isArray(v.sub)) {
      const fields = (v.sub as TypeDef[]).map((fd) => ({
        name: fd.name?.toString(),
        typeStr: friendlyType(fd),
      }));
      return { name: vName, fields };
    }

    // Fallback: treat as unit if unsure
    return { name: vName, fields: [] };
  });

  return { kind: 'EnumData', rustName, solName, variants };
}

export function describeArg(api: ApiPromise, a: any): ArgDesc {
  const name = a.name.toString();
  const typeStr = resolveTypeStr(api, a);
  const def = getTypeDefIfLookup(api, a); // this has to be fixed.
  // We actually never find a lookup...
  if (def) {
    const en = enumFromTypeDef(def);
    if (en) {
      return {
        name,
        typeStr: en.rustName,
        kind: en.kind,
        enumInfo: en,
      };
    }
  }
  return { name, typeStr, kind: classifyPrimitive(typeStr) };
}

function classifyPrimitive(typeStr: string): ParamKind {
  const t = typeStr.replace(/\s/g, '').toLowerCase();
  if (t.includes('multiaddress')) return 'MultiAddressId32';
  if (t.includes('accountid32') || t === 'accountid') return 'AccountId32';
  if (t.startsWith('compact<')) {
    if (t.includes('u128') || t.includes('balance')) return 'CompactU128';
    if (t.includes('u32')) return 'CompactU32';
  }
  if (t === 'bool') return 'Bool';
  if (t === 'u8') return 'U8';
  if (t === 'u16') return 'U16';
  if (t === 'u32') return 'U32';
  if (t === 'u64') return 'U64';
  if (t === 'u128' || t.endsWith('balance')) return 'U128';
  if (t === 'bytes' || t === 'vec<u8>' || t.includes('boundedvec<u8')) return 'Bytes';
  return 'Unsupported';
}

export async function getEntries(api: ApiPromise, pallets: string[]): Promise<Entry[]> {
  const entries: Entry[] = [];

  for (const [section, sectionMethods] of Object.entries(api.tx)) {
    // console.log(JSON.stringify(sectionMethods));
    if (!pallets.includes(section.toLowerCase())) continue;
    for (const [method, extrinsic] of Object.entries(sectionMethods)) {
      // @ts-ignore
      if (!extrinsic || !extrinsic.meta || !('callIndex' in extrinsic)) continue;
      const [palletIndex, callIndex] = extrinsic.callIndex as Uint8Array;

      // gather arg info
      // @ts-ignore
      const metaArgs = extrinsic.toJSON().fields;
      // with fields all params are lookup like, so it is the way to go ^
      // We even have docs then.

      // NOTE!!!! !!!! Way to go: push all of this code to a new branch ->
      // Then open a new clean branch and based on the work here do everything properly.
      /*
        Example:
        ```
        {
          name: 'burn',
          fields: [
            { name: 'value', type: 55, typeName: 'T::Balance', docs: [] },
            { name: 'keep_alive', type: 8, typeName: 'bool', docs: [] }
          ],
          index: 10,
          docs: [
            'Burn the specified liquid free balance from the origin account.',
            '',
            "If the origin's account ends up below the existential deposit as a result",
            'of the burn and `keep_alive` is false, the account will be reaped.',
            '',
            'Unlike sending funds to a _burn_ address, which merely makes the funds inaccessible,',
            'this `burn` operation will reduce total issuance by the amount _burned_.'
          ],
          args: [
            { name: 'value', type: 'Compact<u128>', typeName: 'Balance' },
            { name: 'keepAlive', type: 'bool', typeName: 'bool' }
          ]
        }
        ```
      */
      const args = metaArgs.map((a) => {
        console.log(a.type);
        const typeStr = describeArg(api, a);
        return typeStr;
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
