import { type ApiPromise } from '@polkadot/api';

import { type ClassifiedType, type TypeDesc } from './types';
import { parseFixedArray } from './types/fixedArray';

export type LookupId = number | `Lookup${number}`;

export function descType(api: ApiPromise, lookupId: LookupId): TypeDesc {
  const type = resolveTypeName(api, lookupId);

  if (classifyType(type) === 'Unsupported') {
    // Either struct or enum.
    const typeDef = api.registry.lookup.getTypeDef(lookupId);
    const typeDesc: TypeDesc = {
      name: typeDef.name || typeDef.lookupName || 'Unknown',
      lookupId,
      classifiedType: JSON.parse(typeDef.type)._enum ? 'Enum' : 'Struct',
      complexDesc: JSON.parse(typeDef.type),
    };
    return typeDesc;
  }

  if (classifyType(type) === 'VecFixed') {
    const arrDesc = parseFixedArray(type);
    if (!arrDesc) throw Error('Failed to parse Fixed Array');

    const lookupId = extractLookupId(arrDesc._array.elem);
    if (!lookupId) throw Error('Failed to extract lookup id');
    const arrType = resolveTypeName(api, lookupId);

    const typeDesc: TypeDesc = {
      name: arrType,
      classifiedType: classifyType(arrType),
      lookupId,
    };
    return typeDesc;
  }

  if (classifyType(type) === 'Vec') {
  }

  if (classifyType(type) === 'BoundedVec') {
  }

  return { name: type, lookupId, classifiedType: classifyType(type) };
}

export function resolveTypeName(api: ApiPromise, lookupId: LookupId): string {
  const id = extractLookupId(lookupId.toString());
  const def = api.registry.lookup.getTypeDef(id);
  return (def.lookupName || def.type || 'Unknown').toString();
}

export function classifyType(type: string): ClassifiedType {
  const t = type.replace(/\s/g, '').toLowerCase();

  // fixed-size array: [elem;len]
  const m = t.match(/^\[(.+);(\d+)\]$/);
  if (m) {
    const elem = m[1];
    if (elem === 'u8') return 'FixedBytes'; // encode N raw bytes, no prefix
    return 'VecFixed'; // fixed array of non-primitive elements
  }

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
  if (t.includes('boundedvec<')) return 'BoundedVec';
  if (t.includes('vec<')) return 'Vec';
  return 'Unsupported';
}

export function findTypeByLookupName(api: ApiPromise, name: string) {
  const { lookup } = api.registry;

  for (const portable of lookup.types) {
    const id = portable.id.toNumber();

    // High-level TypeDef (what you usually want)
    const def = lookup.getTypeDef(id); // { info, lookupName, sub, type, ... }

    // 1) Exact lookupName match
    if (def.lookupName === name) {
      return { id, def, si: lookup.getSiType(id) };
    }

    // 2) Some runtimes don't set lookupName; derive it from the SCALE-Info path
    const si = lookup.getSiType(id); // SiType
    const joined = si.path.map((p: any) => p.toString()).join('');
    if (joined === name) {
      return { id, def, si };
    }

    // 3) Fallback: sometimes def.type equals the friendly name
    if (def.type === name) {
      return { id, def, si };
    }
  }

  return null; // not found
}

function extractLookupId(raw: string): number {
  return +`${raw}`.replace(/^Lookup/, '');
}
